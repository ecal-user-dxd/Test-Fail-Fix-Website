<!--
	@component
	Viewer of a `gallery` block (`variant: 'viewer'`, Martial): one image at a time in a WebGL
	viewer, small thumbnails below to change it (shader, see #lib/webgl/reveal.js). The image tilts
	in 3D towards the cursor. Moving to another image reveals it with a radial front growing from
	the middle of the left edge.

	Items: a plain image, or a before / after pair (`after` on the item). On a pair, the after image
	appears in the same radial front, with a radial shading: drag the image left → right, use the
	range below it (arrows, Page Up / Down, Home / End), or click to play the whole transition. On a
	plain image, a click shows the next one.

	Groups: like on the desk, items can carry a `group` label. The labels sit above the thumbnails;
	picking one keeps only that group's thumbnails (they come in one after the other) and opens its
	first image. Picking it again, or Escape, shows every thumbnail again.

	Frame: the ratio of the image shown, never cropped (contain): the two images of a pair keep
	their elements at the same place. The viewer keeps the height of its tallest image, so the page
	does not move when the ratio changes, and it fits in the viewport with its controls, under the
	compact header.

	Three.js loads only when the block comes near the viewport. Until then, and without WebGL, the
	HTML images show the same reveal with a CSS circle (no shading, no tilt). They also carry the
	alt texts for screen readers; the canvas is decorative. Settings: `tuning.reveal`
	(#lib/tuning/values.json, live in the dev tuning panel).
-->
<script>
	/** @import { GalleryItem, Picture as PictureData, Theme } from '#lib/content/types.js' */
	/** @import { Reveal } from '#lib/webgl/reveal.js' */
	import { flip } from 'svelte/animate';
	import { prefersReducedMotion } from 'svelte/motion';
	import { scale } from 'svelte/transition';
	import { dev } from '$app/env';
	import Picture from '#lib/components/ui/Picture.svelte';
	import { getPictures } from '#lib/content/context.js';
	import { site } from '#lib/content/site.js';
	import { tuning } from '#lib/tuning/tuning.svelte.js';

	/**
	 * @typedef {object} Props
	 * @property {GalleryItem[]} items
	 * @property {Theme} theme
	 * @property {boolean} [priority]
	 */

	/** @type {Props} */
	let { items, theme, priority = false } = $props();

	/** Px before a press counts as a drag. */
	const DRAG_START = 4;
	/** Thumbnails of a group come in one after the other, this far apart (ms). */
	const STAGGER = 40;

	const lookup = getPictures();

	/** Item in the viewer. Back to the first one when other items come in (client navigation). */
	let index = $derived.by(() => {
		void items;
		return 0;
	});
	/** Group label picked, or null for every item. */
	let active = $derived.by(() => {
		void items;
		return /** @type {string | null} */ (null);
	});

	const item = $derived(items[index] ?? items[0]);
	const groups = $derived([...new Set(items.flatMap((entry) => (entry.group ? [entry.group] : [])))]);
	/** Indices of the items whose thumbnails show (the picked group, or all). */
	const shown = $derived(
		active === null ? items.map((_, i) => i) : items.flatMap((entry, i) => (entry.group === active ? [i] : []))
	);
	const hasPairs = $derived(items.some((entry) => entry.after));

	/**
	 * Ratio (width / height) of an image.
	 * @param {string} image
	 */
	const ratioOf = (image) => {
		const { w, h } = lookup(image).img;
		return w / h;
	};

	/** Frame ratio: the image's own (the before image of a pair). */
	const ratio = $derived(ratioOf(item.image));
	/** The tallest image sets the viewer's height. */
	const minRatio = $derived(Math.min(...items.map((entry) => ratioOf(entry.image))));

	/** 0 = before, 1 = after (pairs only). */
	let progress = $state(0);
	/** The WebGL render is up and covers the HTML images. */
	let ready = $state(false);
	let dragging = $state(false);

	/** @type {HTMLElement | undefined} */
	let frame = $state();
	/** @type {HTMLCanvasElement | undefined} */
	let canvas = $state();
	/** @type {Reveal | null} */
	let reveal = $state.raw(null);

	/** @type {{ id: number, x: number, y: number, from: number } | null} */
	let press = null;
	/** A drag just ended: the click it produces must not act. */
	let dragged = false;

	/** Width the textures were picked for (frame width × pixel ratio), set when WebGL starts. */
	let textureWidth = 0;
	/** Texture files already requested by a thumbnail hover / focus. */
	const preloaded = new Set();

	/** @type {Record<number, HTMLButtonElement>} */
	const thumbs = {};

	const valueText = $derived(
		progress === 0 ? site.labels.before : progress === 1 ? site.labels.after : `${Math.round(progress * 100)} %`
	);

	/**
	 * @param {number} value
	 * @param {number} [min]
	 * @param {number} [max]
	 */
	const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

	/**
	 * @param {number} a
	 * @param {number} b
	 */
	const mod = (a, b) => ((a % b) + b) % b;

	/**
	 * Smallest WebP of the srcset at least `width` px wide, else the largest.
	 * @param {PictureData} picture
	 * @param {number} width
	 */
	function textureUrl(picture, width) {
		const candidates = (picture.sources.webp ?? '')
			.split(',')
			.map((entry) => {
				const [url, descriptor = ''] = entry.trim().split(/\s+/);
				return { url, width: parseInt(descriptor, 10) };
			})
			.filter((candidate) => candidate.url && candidate.width)
			.sort((a, b) => a.width - b.width);
		return (candidates.find((candidate) => candidate.width >= width) ?? candidates.at(-1))?.url ?? picture.img.src;
	}

	/**
	 * Texture files of an item, at the width chosen when WebGL started. A plain image is its own
	 * after image (the controller loads it once).
	 * @param {GalleryItem} entry
	 */
	function textureUrls(entry) {
		const before = textureUrl(lookup(entry.image), textureWidth);
		return { before, after: entry.after ? textureUrl(lookup(entry.after.image), textureWidth) : before };
	}

	/**
	 * @param {number} value
	 * @param {number} [duration]  ms, to play the transition instead of following
	 */
	function update(value, duration = 0) {
		progress = value;
		reveal?.setProgress(value, duration);
	}

	// Load Three.js and the textures once the block is near the viewport; pause off screen.
	$effect(() => {
		const element = frame;
		const surface = canvas;
		if (!element || !surface) return;

		let disposed = false;
		let started = false;
		/** @type {Reveal | null} */
		let instance = null;

		async function start() {
			try {
				const { createReveal } = await import('#lib/webgl/reveal.js');
				// Read after the await: the item at this moment, not a dependency of the effect.
				textureWidth = /** @type {HTMLElement} */ (element).clientWidth * Math.min(window.devicePixelRatio, 2);
				const urls = textureUrls(item);
				const created = await createReveal({
					canvas: /** @type {HTMLCanvasElement} */ (surface),
					frame: /** @type {HTMLElement} */ (element),
					before: urls.before,
					after: urls.after,
					progress,
					reducedMotion: prefersReducedMotion.current,
					onLost: () => {
						ready = false;
						reveal = null;
					}
				});
				if (disposed) return created.destroy();
				instance = created;
				reveal = created;
				ready = true;
			} catch (error) {
				// No WebGL or a texture failed: the HTML images stay.
				if (dev) console.warn('[GalleryViewer]', error);
			}
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				instance?.setVisible(entry.isIntersecting);
				if (entry.isIntersecting && !started) {
					// A page only passed through by a walk between pages (routes/+layout.svelte) leaves
					// at once: no WebGL for it, the HTML images stay.
					if (document.documentElement.hasAttribute('data-passing')) return;
					started = true;
					start();
				}
			},
			{ rootMargin: '25% 0px' }
		);
		observer.observe(element);

		return () => {
			disposed = true;
			observer.disconnect();
			instance?.destroy();
			reveal = null;
			ready = false;
		};
	});

	$effect(() => {
		reveal?.setReducedMotion(prefersReducedMotion.current);
	});

	// Dev panel: redraw as soon as a setting moves (the render only runs on demand).
	$effect(() => {
		const controller = reveal;
		JSON.stringify(tuning.reveal);
		controller?.refresh();
	});

	// Another item: the controller skips the one it already shows (e.g. right after it starts).
	$effect(() => {
		const urls = textureUrls(item);
		const controller = reveal;
		if (!controller) return;
		controller.setPair(urls.before, urls.after).then(() => {
			// The range was moved while the textures loaded: follow it.
			if (progress !== 0) controller.setProgress(progress);
		});
	});

	/**
	 * Warms the HTTP cache with an item's textures, so a click swaps without waiting.
	 * @param {GalleryItem} entry
	 */
	function preload(entry) {
		if (!reveal) return;
		for (const url of new Set(Object.values(textureUrls(entry)))) {
			if (preloaded.has(url)) continue;
			preloaded.add(url);
			new Image().src = url;
		}
	}

	/** @param {number} i  index in `items` */
	function select(i) {
		if (i === index) return;
		index = i;
		progress = 0;
		thumbs[i]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	}

	/**
	 * Item `step` places away among the thumbnails shown, round the loop.
	 * @param {number} step
	 */
	function move(step) {
		const at = Math.max(0, shown.indexOf(index));
		const next = shown[mod(at + step, shown.length)];
		select(next);
		return next;
	}

	/** @param {string} group */
	function pick(group) {
		if (active === group) {
			active = null;
			return;
		}
		active = group;
		select(items.findIndex((entry) => entry.group === group));
	}

	/** @param {KeyboardEvent} event */
	function onthumbkeydown(event) {
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		/** @type {number | undefined} */
		let next;
		if (event.key === 'ArrowLeft') next = move(-1);
		else if (event.key === 'ArrowRight') next = move(1);
		else if (event.key === 'Home') select((next = shown[0]));
		else if (event.key === 'End') select((next = shown[shown.length - 1]));
		else if (event.key === 'Escape' && active !== null) active = null;
		else return;
		event.preventDefault();
		if (next !== undefined) thumbs[next]?.focus();
	}

	/** @param {KeyboardEvent} event */
	function ongroupkeydown(event) {
		if (event.key === 'Escape' && active !== null) {
			event.preventDefault();
			active = null;
		}
	}

	/** @param {PointerEvent} event */
	function aim(event) {
		if (!frame || !reveal) return;
		const box = frame.getBoundingClientRect();
		reveal.setPointer(
			clamp(((event.clientX - box.left) / box.width) * 2 - 1, -1, 1),
			clamp(((event.clientY - box.top) / box.height) * 2 - 1, -1, 1)
		);
	}

	/** @param {PointerEvent} event */
	function onpointerdown(event) {
		dragged = false;
		if (!item.after || !event.isPrimary || event.button !== 0) return;
		press = { id: event.pointerId, x: event.clientX, y: event.clientY, from: progress };
	}

	/** @param {PointerEvent & { currentTarget: HTMLElement }} event */
	function onpointermove(event) {
		if (event.pointerType !== 'touch') aim(event);
		if (!press || event.pointerId !== press.id) return;
		const dx = event.clientX - press.x;
		if (!dragging) {
			const dy = event.clientY - press.y;
			if (Math.abs(dx) < DRAG_START && Math.abs(dy) < DRAG_START) return;
			// Mostly vertical: leave it to the page scroll.
			if (Math.abs(dy) > Math.abs(dx)) {
				press = null;
				return;
			}
			dragging = true;
			event.currentTarget.setPointerCapture(event.pointerId);
		}
		update(clamp(press.from + dx / event.currentTarget.clientWidth));
	}

	/** @param {PointerEvent} event */
	function onpointerup(event) {
		if (!press || event.pointerId !== press.id) return;
		press = null;
		if (!dragging) return;
		dragging = false;
		dragged = true;
	}

	/** @param {PointerEvent} event */
	function onpointercancel(event) {
		if (!press || event.pointerId !== press.id) return;
		press = null;
		dragging = false;
	}

	function onpointerleave() {
		if (!dragging) reveal?.leave();
	}

	function onclick() {
		if (dragged) {
			dragged = false;
			return;
		}
		if (item.after) update(progress < 0.5 ? 1 : 0, tuning.reveal.playDuration);
		else if (shown.length > 1) move(1);
	}
</script>

<section
	class={['viewer', hasPairs && 'has-pairs', groups.length && 'has-groups', items.length > 1 && 'has-thumbs']}
	data-surface={theme}
	aria-label={hasPairs ? site.labels.beforeAfter : site.labels.viewer}
	style:--ratio-min={minRatio}
>
	<div class="stage">
		<!-- Drag and click are pointer shortcuts; the range and the thumbnails are the keyboard way. -->
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			class={['frame', ready && 'ready', dragging && 'dragging', item.after ? 'pair' : 'single']}
			style:--progress={progress}
			style:--ratio={ratio}
			bind:this={frame}
			{onclick}
			{onpointerdown}
			{onpointermove}
			{onpointerup}
			{onpointercancel}
			{onpointerleave}
			ondragstart={(event) => event.preventDefault()}
		>
			<div class="layer">
				{#if item.after}<span class="sr-only">{site.labels.before}:</span>{/if}
				<Picture
					src={item.image}
					alt={item.alt}
					{ratio}
					fit="contain"
					sizes="(max-width: 864px) calc(100vw - 80px), 91vw"
					{priority}
				/>
			</div>
			{#if item.after}
				<div class="layer after">
					<span class="sr-only">{site.labels.after}:</span>
					<Picture
						src={item.after.image}
						alt={item.after.alt}
						{ratio}
						fit="contain"
						sizes="(max-width: 864px) calc(100vw - 80px), 91vw"
						loading="eager"
					/>
				</div>
			{/if}
			<canvas bind:this={canvas} aria-hidden="true"></canvas>
		</div>
	</div>

	{#if hasPairs}
		<!-- The row keeps its place on a plain image, so the page does not move. -->
		<div class="control" inert={!item.after} class:off={!item.after}>
			<span class="end" aria-hidden="true">{site.labels.before}</span>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={progress}
				style:--fill="{progress * 100}%"
				aria-label={site.labels.beforeAfter}
				aria-valuetext={valueText}
				oninput={(event) => update(Number(event.currentTarget.value))}
			/>
			<span class="end" aria-hidden="true">{site.labels.after}</span>
		</div>
	{/if}

	{#if groups.length}
		<ul class="groups" aria-label={site.labels.deskGroups}>
			{#each groups as group (group)}
				<li>
					<button
						type="button"
						class="group"
						aria-pressed={active === group}
						onclick={() => pick(group)}
						onkeydown={ongroupkeydown}
					>
						{group}
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#if items.length > 1}
		<!-- ← / →, Home / End and Escape act on the thumbnail buttons (they bubble up from them). -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<ul class="thumbs" onkeydown={onthumbkeydown}>
			{#each shown as i, position (items[i].image)}
				{@const entry = items[i]}
				<li
					animate:flip={{ duration: prefersReducedMotion.current ? 0 : 300 }}
					in:scale={{
						start: 0.6,
						duration: prefersReducedMotion.current ? 0 : 300,
						delay: prefersReducedMotion.current ? 0 : position * STAGGER
					}}
				>
					<button
						type="button"
						class="thumb"
						style:--thumb-ratio={ratioOf(entry.image)}
						aria-current={i === index ? 'true' : undefined}
						aria-label="{site.labels.slide} {position + 1} {site.labels.of} {shown.length}"
						bind:this={thumbs[i]}
						onclick={() => select(i)}
						onpointerenter={() => preload(entry)}
						onfocus={() => preload(entry)}
					>
						<Picture src={entry.image} alt="" ratio={ratioOf(entry.image)} fit="contain" sizes="160px" />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.viewer {
		/* Same width as the old carousel's centre slide (peek 60 + gap 20 on each side). */
		--inset: calc(80 * var(--u));
		/* Room around the frame for the tilted corners. */
		--bleed: calc(60 * var(--u));
		--thumb-h: max(40px, calc(64 * var(--u)));
		/* Rows under the image (0 when absent): range, group labels, thumbnails. */
		--control-space: 0px;
		--groups-space: 0px;
		--thumbs-space: 0px;
		/* Tallest viewer that keeps the image and its controls in the viewport, under the compact
		   header (block padding 40 + 40). */
		--fit-height: max(
			240px,
			calc(
				100svh - var(--header-h) - 80 * var(--u) - var(--control-space) - var(--groups-space) -
					var(--thumbs-space)
			)
		);
		container-type: inline-size;
		padding: calc(40 * var(--u)) var(--inset);
	}

	.has-pairs {
		/* Range: 14 above, 44 tall. */
		--control-space: calc(14 * var(--u) + 44px);
	}

	.has-groups {
		/* One line of labels, 10 above. */
		--groups-space: calc(max(24px, 1.4 * var(--type-small)) + 10 * var(--u));
	}

	.has-thumbs {
		/* Thumbnails + 2 × 6 px padding for the focus ring, 10 above. */
		--thumbs-space: calc(var(--thumb-h) + 12px + 10 * var(--u));
	}

	/* Height of the tallest image at full width (capped by the viewport); each frame is centred
	   in it, so another ratio does not move the page. */
	.stage {
		--stage-h: min(var(--fit-height), calc(100cqw / var(--ratio-min)));
		display: grid;
		place-items: center;
		height: var(--stage-h);
	}

	.frame {
		position: relative;
		aspect-ratio: var(--ratio);
		width: min(100cqw, calc(var(--stage-h) * var(--ratio)));
		border-radius: var(--radius-slide);
		touch-action: pan-y;
		user-select: none;
		-webkit-user-select: none;
		--picture-radius: var(--radius-slide);
		--picture-bg: var(--color-gallery);
	}

	/* Letterbox and placeholder colour on orange pages: the page itself. */
	[data-surface='orange'] .frame {
		--picture-bg: var(--page-bg);
	}

	.pair {
		cursor: ew-resize;
	}

	.has-thumbs .single {
		cursor: pointer;
	}

	.dragging {
		cursor: grabbing;
	}

	/* Hairline of the slides, drawn by the shader once WebGL is up. */
	.frame::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-slide);
		box-shadow: inset 0 0 0 1px var(--color-slide-edge);
		pointer-events: none;
	}

	.layer {
		position: absolute;
		inset: 0;
		transition: opacity var(--duration-fade) var(--ease-fade);
	}

	/* CSS reveal (before WebGL, or without it): a circle from the middle of the left edge.
	   142 % (≈ √2) of the circle() reference reaches the far corners at any frame ratio. */
	.after {
		clip-path: circle(calc(var(--progress) * 142%) at 0 50%);
	}

	canvas {
		position: absolute;
		inset: calc(-1 * var(--bleed));
		width: calc(100% + 2 * var(--bleed));
		height: calc(100% + 2 * var(--bleed));
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--duration-fade) var(--ease-fade);
	}

	.ready canvas {
		opacity: 1;
	}

	.ready .layer,
	.ready::after {
		opacity: 0;
	}

	.control {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: calc(16 * var(--u));
		margin-top: calc(14 * var(--u));
		transition: opacity var(--duration-fade) var(--ease-fade);
	}

	.control.off {
		opacity: 0;
	}

	/* Group labels: the desk's (small, faded, the picked one underlined). */
	.groups {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		column-gap: 1em;
		margin-top: calc(10 * var(--u));
	}

	.group {
		display: block;
		min-height: 24px; /* WCAG 2.5.8 target size */
		padding-block: 0.15em;
		font-size: var(--type-small);
		line-height: var(--leading-body);
		color: var(--muted);
		transition: color var(--duration-hover) var(--ease-fade);
	}

	.group[aria-pressed='true'] {
		color: var(--color-ink);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.2em;
	}

	@media (hover: hover) {
		.group:hover {
			color: var(--color-ink);
		}
	}

	/* Centred when they fit, scrolled sideways when they don't (12 items on a phone). */
	.thumbs {
		display: flex;
		justify-content: safe center;
		gap: calc(8 * var(--u));
		margin-top: calc(10 * var(--u));
		padding: 6px;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.thumbs::-webkit-scrollbar {
		display: none;
	}

	.thumbs li {
		flex: none;
	}

	.thumb {
		display: block;
		width: calc(var(--thumb-h) * var(--thumb-ratio));
		height: var(--thumb-h);
		border-radius: var(--radius-chip);
		opacity: 0.45;
		cursor: pointer;
		transition:
			opacity var(--duration-hover),
			box-shadow var(--duration-hover);
		--picture-radius: var(--radius-chip);
		--picture-bg: var(--color-gallery);
	}

	.thumb:hover {
		opacity: 1;
	}

	.thumb[aria-current='true'] {
		opacity: 1;
		box-shadow: 0 0 0 2px var(--color-ink);
	}

	.thumb:focus-visible {
		outline-offset: 4px;
	}

	.end {
		font-size: var(--type-button);
		line-height: var(--leading-button);
		text-transform: uppercase;
		color: var(--color-pager-idle);
	}

	input {
		--thumb: max(14px, calc(18 * var(--u)));
		appearance: none;
		-webkit-appearance: none;
		width: clamp(160px, calc(320 * var(--u)), 480px);
		height: 44px; /* touch target; the visible track is drawn below */
		margin: 0;
		background: transparent;
		cursor: pointer;
	}

	input::-webkit-slider-runnable-track {
		height: 2px;
		background: linear-gradient(to right, var(--color-ink) var(--fill), var(--color-grey) var(--fill));
	}

	input::-moz-range-track {
		height: 2px;
		background: linear-gradient(to right, var(--color-ink) var(--fill), var(--color-grey) var(--fill));
	}

	input::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: var(--thumb);
		height: var(--thumb);
		margin-top: calc((2px - var(--thumb)) / 2);
		border: 0;
		border-radius: 50%;
		background: var(--color-ink);
	}

	input::-moz-range-thumb {
		width: var(--thumb);
		height: var(--thumb);
		border: 0;
		border-radius: 50%;
		background: var(--color-ink);
	}

	/* The global outline would wrap the 44 px box: ring the thumb instead. */
	input:focus-visible {
		outline: none;
	}

	input:focus-visible::-webkit-slider-thumb {
		outline: 2px solid var(--color-ink);
		outline-offset: 2px;
	}

	input:focus-visible::-moz-range-thumb {
		outline: 2px solid var(--color-ink);
		outline-offset: 2px;
	}
</style>
