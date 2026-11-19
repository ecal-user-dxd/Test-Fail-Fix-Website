<!--
	@component
	Before → after reveal, WebGL fork of the before / after carousel (Martial): the after image
	appears in a radial front growing from the middle of the left edge, with a radial shading on
	the front (shader, see #lib/webgl/reveal.js). The image tilts in 3D towards the cursor.

	Controls: drag the image left → right, the range below (arrows, Page Up / Down, Home / End), or
	click the image to play the whole transition one way or the other.

	Three.js loads only when the block comes near the viewport. Until then, and without WebGL, the
	HTML images show the same reveal with a CSS circle (no shading, no tilt). They also carry the
	alt texts for screen readers; the canvas is decorative.
-->
<script>
	/** @import { ImageRef, Picture as PictureData } from '#lib/content/types.js' */
	/** @import { Reveal } from '#lib/webgl/reveal.js' */
	import { prefersReducedMotion } from 'svelte/motion';
	import { dev } from '$app/env';
	import Picture from '#lib/components/ui/Picture.svelte';
	import { getPictures } from '#lib/content/context.js';
	import { site } from '#lib/content/site.js';

	/**
	 * @typedef {object} Props
	 * @property {ImageRef} before
	 * @property {ImageRef} after
	 * @property {boolean} [priority]
	 */

	/** @type {Props} */
	let { before, after, priority = false } = $props();

	/** Px before a press counts as a drag. */
	const DRAG_START = 4;
	/** Length of the transition played on click, in ms. */
	const PLAY_DURATION = 1400;

	const lookup = getPictures();

	/** 0 = before, 1 = after. */
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
	/** A drag just ended: the click it produces must not play the transition. */
	let dragged = false;

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
		const pictures = [lookup(before.image), lookup(after.image)];

		let disposed = false;
		let started = false;
		/** @type {Reveal | null} */
		let instance = null;

		async function start() {
			try {
				const { createReveal } = await import('#lib/webgl/reveal.js');
				const width = /** @type {HTMLElement} */ (element).clientWidth * Math.min(window.devicePixelRatio, 2);
				const created = await createReveal({
					canvas: /** @type {HTMLCanvasElement} */ (surface),
					frame: /** @type {HTMLElement} */ (element),
					before: textureUrl(pictures[0], width),
					after: textureUrl(pictures[1], width),
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
				// No WebGL or a texture failed: the CSS reveal stays.
				if (dev) console.warn('[BeforeAfterReveal]', error);
			}
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				instance?.setVisible(entry.isIntersecting);
				if (entry.isIntersecting && !started) {
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
		if (!event.isPrimary || event.button !== 0) return;
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
		update(progress < 0.5 ? 1 : 0, PLAY_DURATION);
	}
</script>

<section class="reveal" aria-label={site.labels.beforeAfter}>
	<!-- Drag and click are pointer shortcuts; the range below is the keyboard equivalent. -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class={['frame', ready && 'ready', dragging && 'dragging']}
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
			<span class="sr-only">{site.labels.before}:</span>
			<Picture
				src={before.image}
				alt={before.alt}
				ratio={16 / 9}
				sizes="(max-width: 864px) calc(100vw - 80px), 91vw"
				{priority}
			/>
		</div>
		<div class="layer after">
			<span class="sr-only">{site.labels.after}:</span>
			<Picture
				src={after.image}
				alt={after.alt}
				ratio={16 / 9}
				sizes="(max-width: 864px) calc(100vw - 80px), 91vw"
				loading="eager"
			/>
		</div>
		<canvas bind:this={canvas} aria-hidden="true"></canvas>
	</div>

	<div class="control">
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
</section>

<style>
	.reveal {
		/* Same width as the carousel's centre slide (peek 60 + gap 20 on each side). */
		--inset: calc(80 * var(--u));
		/* Room around the frame for the tilted corners. */
		--bleed: calc(60 * var(--u));
		padding: calc(40 * var(--u)) var(--inset);
	}

	.frame {
		position: relative;
		aspect-ratio: 16 / 9;
		border-radius: var(--radius-slide);
		cursor: ew-resize;
		touch-action: pan-y;
		user-select: none;
		-webkit-user-select: none;
		--picture-radius: var(--radius-slide);
		--picture-bg: var(--color-gallery);
	}

	.dragging {
		cursor: grabbing;
	}

	/* Hairline of the carousel slides, drawn by the shader once WebGL is up. */
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
	   130 % of the circle() reference reaches the far corners of a 16:9 frame. */
	.after {
		clip-path: circle(calc(var(--progress) * 130%) at 0 50%);
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
