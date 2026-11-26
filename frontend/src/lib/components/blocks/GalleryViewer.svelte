<!--
	@component
	Viewer of a `gallery` block (`variant: 'viewer'`, Martial): one image at a time in a WebGL
	viewer, small thumbnails below to change it (shader, see #lib/webgl/reveal.js). The image tilts
	in 3D towards the cursor. Moving to another image reveals it with a radial front growing from
	the middle of the left edge.

	Items: a plain image, or a before / after pair (`after` on the item). On a pair, the after image
	appears in the same radial front, with a radial shading: drag it (the front passes under the
	cursor and moves exactly with it, then eases ahead near the sides: 0 % at the left edge of the
	frame, 100 % at the right edge; let go during a quick
	move, it is thrown and glides on, as a photo on the desk, settling with a little spring), use the
	bar below it (a range: arrows, Page Up / Down, Home / End), or click to play the whole
	transition. The bar is a plain line as wide as the image, like the desk videos' progress, always
	there, and so is its knob (Martial); the knob grows a little when the pointer comes within 10vw
	of it, or when it gets the keyboard focus. Until the visitor acts, a pair carries a cue on its
	left, where the reveal starts: "Drag to compare" beside a burst of hairlines that shoot out
	from a dot (the isometric plans' line, Martial). The first time the viewer comes into view on a
	pair, a teaser plays once: the reveal goes to 35 % and back, so the drag shows (not with reduced
	motion, nor once the visitor has acted). On a plain image, a click shows the next one.

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
	/** @import { GalleryImage, Picture as PictureData, Theme } from '#lib/content/types.js' */
	/** @import { Reveal } from '#lib/webgl/reveal.js' */
	import { flip } from 'svelte/animate';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade, scale } from 'svelte/transition';
	import { dev } from '$app/env';
	import Picture from '#lib/components/ui/Picture.svelte';
	import { getPictures } from '#lib/content/context.js';
	import { site } from '#lib/content/site.js';
	import { tuning } from '#lib/tuning/tuning.svelte.js';
	import { dragRadius } from '#lib/webgl/front.js';

	/**
	 * @typedef {object} Props
	 * @property {GalleryImage[]} items  images only (Gallery leaves the videos out)
	 * @property {Theme} theme
	 * @property {boolean} [priority]
	 */

	/** @type {Props} */
	let { items, theme, priority = false } = $props();

	/** Px before a press counts as a drag. */
	const DRAG_START = 4;
	/** The before / after bar shows when the pointer comes this close to it (share of the
	   viewport width, Martial: 10vw). */
	const REACH = 0.1;
	/** Thumbnails of a group come in one after the other, this far apart (ms). */
	const STAGGER = 40;
	/** Teaser, the first time the viewer comes into view on a pair (Martial): the reveal goes this
	   far and back, once. */
	const TEASE = 0.35;
	/** Each way, ms (a click plays 0 → 1 in tuning.reveal.playDuration). */
	const TEASE_DURATION = 900;
	/** Pause at TEASE before going back, ms. */
	const TEASE_HOLD = 250;
	/** Wait once the viewer is in view and WebGL is up, so the before image shows first, ms. */
	const TEASE_DELAY = 500;
	/** Share of the frame that must be in view. */
	const TEASE_IN_VIEW = 0.6;
	/** Cue's burst (viewBox units, centre 0 0): rays every 30°, long and short in turn, from
	   `from` to `to` away from the centre. */
	const RAYS = Array.from({ length: 12 }, (_, i) => {
		const angle = (i * Math.PI) / 6;
		const [from, to] = i % 2 ? [9, 17] : [8, 25];
		const at = (/** @type {number} */ r) => [Math.cos(angle) * r, Math.sin(angle) * r].map((v) => +v.toFixed(2));
		const [x1, y1] = at(from);
		const [x2, y2] = at(to);
		return { x1, y1, x2, y2, short: i % 2 === 1 };
	});

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

	/** The pointer is within REACH of the bar, or presses it: the bar shows. */
	let near = $state(false);
	let holding = $state(false);
	/** Duration of the bar's fill change: the click's play, 0 while it follows (drag, range). */
	let fillDuration = $state(0);
	/** @type {HTMLInputElement | undefined} */
	let range = $state();
	/** Row of the bar, tilted with the image. */
	/** @type {HTMLElement | undefined} */
	let control = $state();
	/** Last pointer position (mouse, pen), to check the reach again when the page scrolls. */
	/** @type {{ x: number, y: number } | null} */
	let lastPointer = null;

	/** @type {{ id: number, x: number, y: number } | null} */
	let press = null;
	/** A drag just ended: the click it produces must not act. */
	let dragged = false;

	/** The teaser has played, or will not: the visitor acted first. Once per viewer. */
	let teased = $state(false);
	/** The visitor pressed the image, used the range or the thumbnails: the cue goes. */
	let acted = $state(false);
	/** TEASE_IN_VIEW of the frame is in view. */
	let inView = $state(false);
	/** Pending way back of the teaser. */
	let teaseTimer = 0;

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
	 * @param {GalleryImage} entry
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
		fillDuration = duration;
		reveal?.setProgress(value, duration);
	}

	/** Teaser: the reveal goes to TEASE and back, the bar with it, as a click plays it. */
	function tease() {
		teased = true;
		update(TEASE, TEASE_DURATION);
		teaseTimer = window.setTimeout(() => {
			teaseTimer = 0;
			update(0, TEASE_DURATION);
		}, TEASE_DURATION + TEASE_HOLD);
	}

	/** The visitor acts (press on the image, range, thumbnails): no teaser, or no way back, and
	   no cue. */
	function stopTease() {
		teased = true;
		acted = true;
		clearTimeout(teaseTimer);
		teaseTimer = 0;
	}

	/**
	 * Tilts the bar and the cue with the image, on each frame of the WebGL render (straight to the element:
	 * no Svelte update per frame). -1..1 of `tuning.reveal.tilt`, see the `.control` CSS.
	 * @param {number} x  right side away
	 * @param {number} y  bottom side away
	 */
	function tiltBar(x, y) {
		for (const element of [control, frame]) {
			element?.style.setProperty('--tilt-x', String(x));
			element?.style.setProperty('--tilt-y', String(y));
		}
	}

	/** Distance from the last pointer position to the bar (its line, the middle of the range). */
	function checkReach() {
		if (!range || !lastPointer) return;
		const box = range.getBoundingClientRect();
		const dx = Math.max(box.left - lastPointer.x, 0, lastPointer.x - box.right);
		const dy = lastPointer.y - (box.top + box.height / 2);
		near = Math.hypot(dx, dy) <= REACH * window.innerWidth;
	}

	/** @param {PointerEvent} event */
	function onwindowpointermove(event) {
		// Touch screens: the bar is always there (CSS).
		if (!hasPairs || event.pointerType === 'touch') return;
		lastPointer = { x: event.clientX, y: event.clientY };
		checkReach();
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
						tiltBar(0, 0);
					},
					onTilt: tiltBar,
					// Thrown front: the bar follows its glide.
					onGlide: (value) => {
						progress = value;
						fillDuration = 0;
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

	// Teaser: how much of the frame is in view, until it has played.
	$effect(() => {
		const element = frame;
		if (!element || !hasPairs || teased) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				inView = entry.intersectionRatio >= TEASE_IN_VIEW * 0.99;
			},
			{ threshold: TEASE_IN_VIEW }
		);
		observer.observe(element);
		return () => observer.disconnect();
	});

	// It plays once the frame is in view on a pair and WebGL is up (the CSS fallback does not
	// animate), after a short wait; scrolled away meanwhile, it waits for the next time. Reduced
	// motion: never.
	$effect(() => {
		if (teased || !inView || !ready || !item.after || prefersReducedMotion.current) return;
		const timer = window.setTimeout(tease, TEASE_DELAY);
		return () => clearTimeout(timer);
	});

	// Leaving the page during the teaser.
	$effect(() => () => clearTimeout(teaseTimer));

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
	 * @param {GalleryImage} entry
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
		stopTease();
		index = i;
		progress = 0;
		fillDuration = 0;
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

	/**
	 * The front follows the dragged cursor: it passes under it and moves exactly with it. WebGL
	 * aims it through the tilt (reveal.drag); the CSS circle (no WebGL yet) takes the cursor's
	 * distance to the middle of the left edge as its radius.
	 * @param {PointerEvent} event
	 */
	function dragFront(event) {
		fillDuration = 0;
		if (reveal) {
			progress = reveal.drag(event.clientX, event.clientY);
			return;
		}
		if (!frame) return;
		const box = frame.getBoundingClientRect();
		const x = event.clientX - box.left;
		const y = event.clientY - box.top - box.height / 2;
		// Radius of the circle at 1: 142 % of the circle() reference (see CSS).
		const end = (1.42 * Math.hypot(box.width, box.height)) / Math.SQRT2;
		const radius = dragRadius(Math.hypot(x, y), x / box.width, tuning.reveal.edgeZone, 0, end);
		progress = clamp(radius / end);
	}

	/** @param {PointerEvent} event */
	function onpointerdown(event) {
		dragged = false;
		if (!item.after || !event.isPrimary || event.button !== 0) return;
		stopTease();
		press ={ id: event.pointerId, x: event.clientX, y: event.clientY };
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
		dragFront(event);
	}

	/** @param {PointerEvent} event */
	function onpointerup(event) {
		if (!press || event.pointerId !== press.id) return;
		press = null;
		if (!dragging) return;
		dragging = false;
		dragged = true;
		reveal?.release();
	}

	/** @param {PointerEvent} event */
	function onpointercancel(event) {
		if (!press || event.pointerId !== press.id) return;
		press = null;
		dragging = false;
		reveal?.release(false);
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

<svelte:window
	onpointermove={onwindowpointermove}
	onscroll={checkReach}
	onpointerup={() => (holding = false)}
	onpointercancel={() => (holding = false)}
/>

<section
	class={['viewer', hasPairs && 'has-pairs', groups.length && 'has-groups', items.length > 1 && 'has-thumbs']}
	data-surface={theme}
	aria-label={hasPairs ? site.labels.beforeAfter : site.labels.viewer}
	style:--ratio-min={minRatio}
	style:--ratio={ratio}
	style:--tilt={tuning.reveal.tilt}
	style:--perspective={tuning.reveal.perspective}
>
	<div class="stage">
		<!-- Drag and click are pointer shortcuts; the range and the thumbnails are the keyboard way. -->
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			class={['frame', ready && 'ready', dragging && 'dragging', item.after ? 'pair' : 'single']}
			style:--progress={progress}
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
			{#if item.after && !acted}
				<!-- Decorative: the range carries the name. -->
				<div
					class="cue"
					aria-hidden="true"
					transition:fade={{ duration: prefersReducedMotion.current ? 0 : 300 }}
				>
					<svg class="burst" viewBox="-30 -30 60 60">
						{#each RAYS as ray, i (i)}
							<line
								x1={ray.x1}
								y1={ray.y1}
								x2={ray.x2}
								y2={ray.y2}
								class:short={ray.short}
								pathLength="1"
							/>
						{/each}
						<circle r="2.5" />
					</svg>
					<span class="cue-label">{site.labels.dragToCompare}</span>
				</div>
			{/if}
		</div>
	</div>

	{#if hasPairs}
		<!-- The row keeps its place on a plain image, so the page does not move. The bar is drawn
		     under a see-through native range: keyboard, screen readers, click and drag on it. -->
		<div
			class={[
				'control',
				!item.after && 'off',
				(near || holding) && 'near',
				holding && 'holding'
			]}
			inert={!item.after}
			bind:this={control}
		>
			<span
				class="bar"
				aria-hidden="true"
				style:--fill={progress}
				style:--fill-duration="{fillDuration}ms"
			>
				<span class="knob"></span>
			</span>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={progress}
				aria-label={site.labels.beforeAfter}
				aria-valuetext={valueText}
				bind:this={range}
				oninput={(event) => {
					stopTease();
					update(Number(event.currentTarget.value));
				}}
				onpointerdown={() => {
					stopTease();
					holding = true;
				}}
			/>
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
		/* Height of the tallest image at full width (capped by the viewport), and width of the image
		   shown: the frame and the before / after bar. The cqw resolve where they are used, in
		   this container. */
		--stage-h: min(var(--fit-height), calc(100cqw / var(--ratio-min)));
		--frame-w: min(100cqw, calc(var(--stage-h) * var(--ratio)));
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
		display: grid;
		place-items: center;
		height: var(--stage-h);
	}

	.frame {
		position: relative;
		aspect-ratio: var(--ratio);
		width: var(--frame-w);
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

	/* Cue, until the visitor acts: on the left of the image, where the reveal starts, a burst of
	   hairlines (the isometric plans' black 1.5 line, round caps) shooting out from a dot, and
	   "Drag to compare" beside it. Over the image, tilted with it (same transform as .control,
	   around the frame's middle); presses go through to the frame. */
	.cue {
		--burst: max(44px, calc(64 * var(--u)));
		position: absolute;
		top: 50%;
		left: max(4px, calc(24 * var(--u)));
		display: flex;
		align-items: center;
		gap: calc(4 * var(--u));
		translate: 0 -50%;
		pointer-events: none;
		transform-origin: calc(var(--frame-w) / 2 - max(4px, calc(24 * var(--u)))) 50%;
		transform: perspective(calc(var(--frame-w) * var(--perspective)))
			rotateX(calc(var(--tilt-y, 0) * var(--tilt) * -1deg))
			rotateY(calc(var(--tilt-x, 0) * var(--tilt) * 1deg));
	}

	.burst {
		flex: none;
		width: var(--burst);
		height: var(--burst);
		overflow: visible;
		fill: none;
		stroke: var(--color-ink);
		/* viewBox units: about 1.5 px at 1728 px wide. */
		stroke-width: 1.4;
		stroke-linecap: round;
	}

	.burst circle {
		fill: var(--color-ink);
		stroke: none;
	}

	/* A spark per ray: drawn from the dot outwards, then its tail leaves it outwards too; the
	   short rays a beat later. One burst, then a rest (2.4 s round). */
	.burst line {
		stroke-dasharray: 1 1;
		stroke-dashoffset: 1;
		animation: spark 2400ms cubic-bezier(0.22, 1, 0.36, 1) infinite;
	}

	.burst .short {
		animation-delay: 120ms;
	}

	@keyframes spark {
		0% {
			stroke-dashoffset: 1;
		}
		22% {
			stroke-dashoffset: 0;
		}
		45%,
		100% {
			stroke-dashoffset: -1;
		}
	}

	/* Small, on a paper chip with the same hairline: readable on any image. */
	.cue-label {
		padding: 0.35em 0.7em;
		border: 1px solid var(--color-ink);
		border-radius: 999px;
		font-size: var(--type-small);
		line-height: 1;
		white-space: nowrap;
		color: var(--color-ink);
		background: var(--color-paper);
	}

	/* Reduced motion: the burst stays drawn, still. */
	@media (prefers-reduced-motion: reduce) {
		.burst line {
			stroke-dashoffset: 0;
			animation: none;
		}
	}

	/* Before / after bar: the desk video's progress line (GalleryDesk .progress), an ink fill on a
	   light track, as wide as the image, always there, its knob too (Martial). The range lies over
	   it, see-through. */
	.control {
		--control-gap: calc(14 * var(--u));
		display: grid;
		place-items: center;
		margin-top: var(--control-gap);
		/* Tilts with the image (Martial), as if it lay on its plane: the WebGL tilt (reveal.js,
		   --tilt-x / --tilt-y set on each frame) with the same camera distance (× image width),
		   around the middle of the image, half the stage above this row. The bar sits below the
		   middle, like the image's bottom edge: they move together. */
		transform-origin: 50% calc(-1 * (var(--stage-h) / 2 + var(--control-gap)));
		transform: perspective(calc(var(--frame-w) * var(--perspective)))
			rotateX(calc(var(--tilt-y, 0) * var(--tilt) * -1deg))
			rotateY(calc(var(--tilt-x, 0) * var(--tilt) * 1deg));
		transition: opacity var(--duration-fade) var(--ease-fade);
	}

	.control > * {
		grid-area: 1 / 1;
	}

	.control.off {
		opacity: 0;
	}

	/* Drawn above the range (positioned, the knob's z-index): presses go through to the range,
	   on the line and on the knob too. */
	.bar {
		--knob: max(14px, calc(18 * var(--u)));
		position: relative;
		width: var(--frame-w);
		height: 3px;
		border-radius: 2px;
		background: var(--color-grey);
		pointer-events: none;
	}

	/* Fill and knob follow the drag; on a click, they play with the image (the shader's cubic
	   in-out). */
	.bar::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: var(--color-ink);
		transform-origin: left;
		scale: var(--fill) 1;
		transition: scale var(--fill-duration) cubic-bezier(0.65, 0, 0.35, 1);
	}

	/* Knob: always there (Martial); grows a little (scale, quart in-out) when the pointer comes
	   within REACH of the bar, while it is pressed or has the keyboard focus (ringed). */
	.knob {
		position: absolute;
		top: 50%;
		left: calc(var(--fill) * 100%);
		z-index: 1;
		width: var(--knob);
		height: var(--knob);
		margin: calc(var(--knob) / -2) 0 0 calc(var(--knob) / -2);
		border-radius: 50%;
		background: var(--color-ink);
		transition:
			scale var(--duration-bar) var(--ease-bar),
			left var(--fill-duration) cubic-bezier(0.65, 0, 0.35, 1);
	}

	.near .knob,
	.control:has(input:focus-visible) .knob {
		scale: 1.25;
	}

	.control:has(input:focus-visible) .knob {
		outline: 2px solid var(--color-ink);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.bar::after,
		.knob {
			transition: none;
		}
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

	/* See-through: the bar and its knob are what shows (focus ring included). A 1 px thumb, so the
	   value under the pointer matches the fill across the whole width. */
	input {
		appearance: none;
		-webkit-appearance: none;
		width: var(--frame-w);
		height: 44px; /* touch target */
		margin: 0;
		background: transparent;
		opacity: 0;
		cursor: grab;
	}

	.holding input {
		cursor: grabbing;
	}

	input::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 1px;
		height: 44px;
	}

	input::-moz-range-thumb {
		width: 1px;
		height: 44px;
		border: 0;
	}
</style>
