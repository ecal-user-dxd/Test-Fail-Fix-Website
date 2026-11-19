<!--
	@component
	Desk view of a `gallery` block (`variant: 'desk'`): the photos lie scattered and overlapping on
	a table, each slightly rotated. Drag a photo to move it and uncover the ones below: it lifts and
	tilts in 3D with the speed of the move. Let go during a quick move and it is thrown: it slides
	on, slows down and bounces off the edges of the desk. Click it to drop it on the pile in the
	middle of the desk. The photo picked last is always on top.

	Positions are fractions (0–1) of the free space around a photo, so a photo never leaves the desk
	and the layout follows any desk size. The scatter is seeded by the image paths: the same on the
	server and in the browser, the same on every visit.

	Keyboard: Enter / Space drops the focused photo on the pile, arrow keys move it (Shift: further);
	a focused photo shows above the others. Touch: a vertical swipe scrolls the page, other drags
	move the photo. Reduced motion: no flight, no throw and no tilt.

	Settings: `tuning.desk` (`#lib/tuning/values.json`, live in the dev tuning panel): the grid, and
	`inertia` (share of the release speed kept, 0 = no throw), `friction` (1/s, higher = shorter
	slide), `bounce` (share of the speed kept off an edge).
-->
<script>
	/** @import { ImageRef, Theme } from '#lib/content/types.js' */
	import { prefersReducedMotion } from 'svelte/motion';
	import { SvelteMap } from 'svelte/reactivity';
	import Picture from '#lib/components/ui/Picture.svelte';
	import { getPictures } from '#lib/content/context.js';
	import { site } from '#lib/content/site.js';
	import { tuning } from '#lib/tuning/tuning.svelte.js';

	/**
	 * @typedef {object} Props
	 * @property {ImageRef[]} items
	 * @property {Theme} theme
	 * @property {boolean} [priority]
	 */

	/** @type {Props} */
	let { items, theme, priority = false } = $props();

	/**
	 * Where a photo lies: `x` / `y` are fractions of the free space (0 = left / top edge of the desk,
	 * 1 = right / bottom edge), `r` its rotation in degrees, `z` its stacking order.
	 * @typedef {{ x: number, y: number, r: number, z: number }} Place
	 */

	/** Px before a pointer move counts as a drag (below: a click). */
	const DRAG_START = 5;
	/** Share of the desk the scatter covers, and random offset of each photo around its spot. */
	const SPREAD = 0.8;
	const JITTER = 0.2;
	/** Rotation of the scattered photos, in degrees (at least 2, so none looks straight). */
	const MAX_ROTATION = 7;
	/** Pile in the middle: random offset (fraction of the free space) and rotation (degrees). */
	const PILE_SPREAD = 0.08;
	const PILE_ROTATION = 5;
	/** Arrow keys: step as a fraction of the free space, with and without Shift. */
	const KEY_STEP = 0.02;
	const KEY_STEP_LARGE = 0.1;
	/** 3D tilt while moving: degrees per px/ms of speed, and maximum. */
	const TILT_PER_SPEED = 12;
	const TILT_MAX = 14;
	/** Throw: release speed measured over the last ms of the drag; none if the pointer stood still
	   that long before release; px/ms to start sliding, and to stop. */
	const THROW_WINDOW = 80;
	const THROW_STILL = 60;
	const THROW_MIN = 0.1;
	const GLIDE_STOP = 0.01;

	const lookup = getPictures();
	const uid = $props.id();
	const hint = `${uid}-hint`;

	/** Photo width in % of the desk width: large for a few photos, smaller for many. */
	const size = $derived(Math.min(60, 22 + 40 / Math.sqrt(Math.max(1, items.length))));

	/**
	 * Grid drawn on the desk, `tuning.desk` (`#lib/tuning/values.json`, live in the dev tuning
	 * panel): spacing in Figma px at 1728 (fluid like the rest), line width in px, line colour +
	 * opacity, background of the desk on white pages (orange pages keep the page colour).
	 */
	const desk = $derived(tuning.desk);
	const gridColor = $derived(
		desk.grid
			? `color-mix(in srgb, ${desk.lineColor} ${desk.lineOpacity * 100}%, transparent)`
			: 'transparent'
	);

	/** Back to the scatter when other items come in. */
	let places = $derived(scatter(items));

	const top = $derived(Math.max(0, ...places.map((place) => place.z)));

	/** Index of the photo being dragged, -1 when none. */
	let dragging = $state(-1);

	/** @typedef {{ x: number, y: number }} Vector */

	/** Thrown photos while they slide, by index: velocity in px/ms, free space in px. */
	/** @type {SvelteMap<number, { velocity: Vector, rangeX: number, rangeY: number }>} */
	const glides = new SvelteMap();

	/** 3D tilt of the moving photos (dragged or sliding), in degrees, by index. */
	/** @type {Record<number, Vector>} */
	let tilts = $state({});

	/** @type {HTMLElement | undefined} */
	let surface = $state();

	/**
	 * @type {{ id: number, index: number, x: number, y: number, from: Place, rangeX: number,
	 *   rangeY: number } | null}
	 */
	let pointer = null;

	/** A drag just ended: the click that follows it must not send the photo to the pile. */
	let dragged = false;

	/** Pointer speed of the drag in px/ms, smoothed (tilt), and the latest samples (throw). */
	let velocity = { x: 0, y: 0 };
	/** @type {{ x: number, y: number, time: number }[]} */
	let samples = [];

	let frame = 0;
	let lastFrame = 0;

	// Other items (or unmount): stop every move.
	$effect(() => {
		void items;
		return () => {
			cancelAnimationFrame(frame);
			frame = 0;
			glides.clear();
			tilts = {};
		};
	});

	/**
	 * @param {number} value
	 * @param {number} [min]
	 * @param {number} [max]
	 */
	const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

	/** @param {string} text */
	function hash(text) {
		let h = 2166136261;
		for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
		return h >>> 0;
	}

	/**
	 * Seeded random numbers in [0, 1) (mulberry32).
	 * @param {number} seed
	 */
	function seeded(seed) {
		return () => {
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	/**
	 * Loose grid in reading order (rows centred), pulled towards the middle and shaken.
	 * @param {ImageRef[]} items
	 * @returns {Place[]}
	 */
	function scatter(items) {
		const random = seeded(hash(items.map((item) => item.image).join('|')));
		const count = items.length;
		const cols = Math.max(1, Math.round(Math.sqrt(count * 1.6)));
		const rows = Math.ceil(count / cols);
		return items.map((_, i) => {
			const row = Math.floor(i / cols);
			const inRow = Math.min(cols, count - row * cols);
			const x = inRow > 1 ? (i % cols) / (inRow - 1) : 0.5;
			const y = rows > 1 ? row / (rows - 1) : 0.5;
			return {
				x: clamp(0.5 + (x - 0.5) * SPREAD + (random() - 0.5) * JITTER),
				y: clamp(0.5 + (y - 0.5) * SPREAD + (random() - 0.5) * JITTER),
				r: (random() < 0.5 ? -1 : 1) * (2 + random() * (MAX_ROTATION - 2)),
				z: i + 1
			};
		});
	}

	/**
	 * @param {number} i
	 * @param {Partial<Place>} change
	 */
	function update(i, change) {
		places = places.with(i, { ...places[i], ...change });
	}

	/**
	 * Stacking order that puts photo `i` on top (unchanged if it already is).
	 * @param {number} i
	 */
	const above = (i) => (places[i].z === top ? top : top + 1);

	/** @param {number} i */
	function pile(i) {
		glides.delete(i);
		update(i, {
			x: 0.5 + (Math.random() - 0.5) * PILE_SPREAD,
			y: 0.5 + (Math.random() - 0.5) * PILE_SPREAD,
			r: (Math.random() * 2 - 1) * PILE_ROTATION,
			z: above(i)
		});
	}

	/**
	 * The leading edge sinks: rotateY(+) sends the right edge back, rotateX(-) the bottom edge.
	 * @param {Vector} speed  px/ms
	 * @returns {Vector}
	 */
	const tiltOf = (speed) => ({
		x: clamp(-speed.y * TILT_PER_SPEED, -TILT_MAX, TILT_MAX),
		y: clamp(speed.x * TILT_PER_SPEED, -TILT_MAX, TILT_MAX)
	});

	/** Runs the frame loop until nothing moves. */
	function animate() {
		if (frame || prefersReducedMotion.current) return;
		lastFrame = performance.now();
		frame = requestAnimationFrame(tick);
	}

	/** @param {number} now */
	function tick(now) {
		const dt = Math.min(now - lastFrame, 50);
		lastFrame = now;
		/** @type {Record<number, Vector>} */
		const next = {};

		if (dragging !== -1) {
			// Decays, so a photo held still settles flat.
			velocity = { x: velocity.x * 0.82, y: velocity.y * 0.82 };
			next[dragging] = tiltOf(velocity);
		}

		const { friction, bounce } = tuning.desk;
		const keep = Math.exp((-friction * dt) / 1000);
		for (const [i, glide] of glides) {
			const { velocity: speed, rangeX, rangeY } = glide;
			let x = places[i].x + (rangeX > 0 ? (speed.x * dt) / rangeX : 0);
			let y = places[i].y + (rangeY > 0 ? (speed.y * dt) / rangeY : 0);
			// Past an edge: back on the desk, bounced.
			if (x < 0 || x > 1) {
				x = clamp(x);
				speed.x *= -bounce;
			}
			if (y < 0 || y > 1) {
				y = clamp(y);
				speed.y *= -bounce;
			}
			speed.x *= keep;
			speed.y *= keep;
			update(i, { x, y });
			if (Math.hypot(speed.x, speed.y) < GLIDE_STOP) glides.delete(i);
			else next[i] = tiltOf(speed);
		}

		tilts = next;
		frame = dragging !== -1 || glides.size > 0 ? requestAnimationFrame(tick) : 0;
	}

	/**
	 * Pointer speed over the end of the drag, in px/ms; none if the pointer stood still.
	 * @param {number} time  release time
	 * @returns {Vector}
	 */
	function releaseSpeed(time) {
		const first = samples[0];
		const last = samples.at(-1);
		if (!first || !last || time - last.time > THROW_STILL) return { x: 0, y: 0 };
		const span = last.time - first.time;
		if (span < 8) return { x: 0, y: 0 };
		return { x: (last.x - first.x) / span, y: (last.y - first.y) / span };
	}

	function endDrag() {
		pointer = null;
		dragging = -1;
		velocity = { x: 0, y: 0 };
		samples = [];
	}

	/**
	 * @param {PointerEvent & { currentTarget: HTMLButtonElement }} event
	 * @param {number} i
	 */
	function onpointerdown(event, i) {
		dragged = false;
		if (!event.isPrimary || event.button !== 0 || !surface) return;
		// Caught while sliding: it stops under the pointer.
		glides.delete(i);
		const photo = /** @type {HTMLElement} */ (event.currentTarget.parentElement);
		pointer = {
			id: event.pointerId,
			index: i,
			x: event.clientX,
			y: event.clientY,
			from: places[i],
			rangeX: surface.clientWidth - photo.offsetWidth,
			rangeY: surface.clientHeight - photo.offsetHeight
		};
		velocity = { x: 0, y: 0 };
		samples = [{ x: event.clientX, y: event.clientY, time: event.timeStamp }];
		update(i, { z: above(i) });
	}

	/** @param {PointerEvent & { currentTarget: HTMLButtonElement }} event */
	function onpointermove(event) {
		if (!pointer || event.pointerId !== pointer.id) return;
		const dx = event.clientX - pointer.x;
		const dy = event.clientY - pointer.y;
		if (dragging !== pointer.index) {
			if (Math.abs(dx) < DRAG_START && Math.abs(dy) < DRAG_START) return;
			dragging = pointer.index;
			event.currentTarget.setPointerCapture(event.pointerId);
			animate();
		}

		const { from, rangeX, rangeY } = pointer;
		update(pointer.index, {
			x: rangeX > 0 ? clamp(from.x + dx / rangeX) : from.x,
			y: rangeY > 0 ? clamp(from.y + dy / rangeY) : from.y
		});

		const last = samples.at(-1) ?? { x: event.clientX, y: event.clientY, time: 0 };
		const time = Math.max(1, event.timeStamp - last.time);
		velocity = {
			x: velocity.x * 0.6 + ((event.clientX - last.x) / time) * 0.4,
			y: velocity.y * 0.6 + ((event.clientY - last.y) / time) * 0.4
		};
		samples.push({ x: event.clientX, y: event.clientY, time: event.timeStamp });
		samples = samples.filter((sample) => event.timeStamp - sample.time <= THROW_WINDOW);
	}

	/** @param {PointerEvent} event */
	function onpointerup(event) {
		if (!pointer || event.pointerId !== pointer.id) return;
		if (dragging !== -1) {
			dragged = true;
			const { inertia } = tuning.desk;
			const speed = releaseSpeed(event.timeStamp);
			if (inertia > 0 && Math.hypot(speed.x, speed.y) > THROW_MIN && !prefersReducedMotion.current) {
				glides.set(pointer.index, {
					velocity: { x: speed.x * inertia, y: speed.y * inertia },
					rangeX: pointer.rangeX,
					rangeY: pointer.rangeY
				});
			}
		}
		endDrag();
		animate();
	}

	/** @param {PointerEvent} event */
	function onpointercancel(event) {
		if (!pointer || event.pointerId !== pointer.id) return;
		endDrag();
	}

	/** @param {number} i */
	function onclick(i) {
		if (dragged) {
			dragged = false;
			return;
		}
		pile(i);
	}

	/**
	 * @param {KeyboardEvent} event
	 * @param {number} i
	 */
	function onkeydown(event, i) {
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
		const [dx, dy] =
			{ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key] ??
			[0, 0];
		if (!dx && !dy) return;
		event.preventDefault();
		glides.delete(i);
		update(i, {
			x: clamp(places[i].x + dx * step),
			y: clamp(places[i].y + dy * step),
			z: above(i)
		});
	}
</script>

<div
	class="desk"
	data-surface={theme}
	style:--desk-bg={desk.background}
	style:--grid-size={desk.spacing}
	style:--grid-line="{desk.lineWidth}px"
	style:--grid-color={gridColor}
>
	<p class="sr-only" id={hint}>{site.labels.deskHint}</p>
	<ul
		class="surface"
		aria-label={site.labels.desk}
		style:--size={size}
		style:--top={top}
		bind:this={surface}
	>
		{#each items as item, i (item.image)}
			{@const place = places[i]}
			{@const picture = lookup(item.image)}
			<li
				class={['photo', dragging === i && 'dragging', glides.has(i) && 'gliding']}
				style:--x={place.x}
				style:--y={place.y}
				style:--r="{place.r}deg"
				style:--z={place.z}
				style:--ratio={picture.img.w / picture.img.h}
				style:--tilt-x="{tilts[i]?.x ?? 0}deg"
				style:--tilt-y="{tilts[i]?.y ?? 0}deg"
			>
				<button
					type="button"
					class="handle"
					aria-describedby={hint}
					onpointerdown={(event) => onpointerdown(event, i)}
					{onpointermove}
					{onpointerup}
					{onpointercancel}
					onclick={() => onclick(i)}
					onkeydown={(event) => onkeydown(event, i)}
					ondragstart={(event) => event.preventDefault()}
				>
					<Picture
						src={item.image}
						alt={item.alt}
						sizes="(max-width: 767px) 82vw, {Math.ceil(size)}vw"
						priority={priority && i === 0}
					/>
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	/* Same frame as the grid gallery (band on white pages, side margins of the figure block), with a
	   grid centred on the band: one line on the left and top edge of each cell. */
	.desk {
		padding: var(--gutter) var(--margin);
		background-image:
			linear-gradient(to right, var(--grid-color) var(--grid-line), transparent 0),
			linear-gradient(to bottom, var(--grid-color) var(--grid-line), transparent 0);
		background-size: calc(var(--grid-size) * var(--u)) calc(var(--grid-size) * var(--u));
		background-position: center;
	}

	[data-surface='white'] {
		background-color: var(--desk-bg);
	}

	.surface {
		position: relative;
		aspect-ratio: 16 / 9;
		container-type: size;
		user-select: none;
		-webkit-user-select: none;
	}

	/* Photo width: --size % of the desk, but never taller than 86 % of it. Its top-left corner
	   moves across the free space: (desk − photo) × x, (desk − photo height) × y. */
	.photo {
		--photo-w: min(var(--size) * 1cqw, 86cqh * var(--ratio));
		position: absolute;
		top: 0;
		left: 0;
		z-index: var(--z);
		width: var(--photo-w);
		translate: calc(var(--x) * (100cqw - var(--photo-w)))
			calc(var(--y) * (100cqh - var(--photo-w) / var(--ratio)));
		rotate: var(--r);
		transition:
			translate var(--duration-slide) var(--ease-slide),
			rotate var(--duration-slide) var(--ease-slide);
	}

	/* Moved frame by frame: dragged or sliding after a throw. */
	.photo.dragging,
	.photo.gliding {
		transition: none;
	}

	/* Keyboard focus brings the photo above the pile while it is focused. */
	.photo:has(:focus-visible) {
		z-index: calc(var(--top) + 1);
	}

	.handle {
		display: block;
		width: 100%;
		border-radius: var(--radius-screen);
		box-shadow: var(--shadow-photo);
		cursor: grab;
		touch-action: pan-y;
		-webkit-tap-highlight-color: transparent;
		transform: perspective(1000px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
		transition:
			transform var(--duration-fade) var(--ease-fade),
			scale var(--duration-hover) var(--ease-fade),
			box-shadow var(--duration-hover) var(--ease-fade);
		--picture-radius: var(--radius-screen);
	}

	.handle :global(img) {
		pointer-events: none;
		-webkit-user-drag: none;
		-webkit-touch-callout: none;
	}

	@media (hover: hover) {
		.handle:hover {
			scale: 1.02;
			box-shadow: var(--shadow-photo-lifted);
		}
	}

	/* The tilt follows the move frame by frame; lifted while dragged, back on the desk when thrown. */
	.dragging .handle,
	.gliding .handle {
		transition:
			scale var(--duration-hover) var(--ease-fade),
			box-shadow var(--duration-hover) var(--ease-fade);
	}

	.dragging .handle {
		scale: 1.05;
		box-shadow: var(--shadow-photo-lifted);
		cursor: grabbing;
	}

	@media (max-width: 767px) {
		.surface {
			aspect-ratio: 4 / 5;
		}

		.photo {
			--photo-w: min(min(var(--size) * 1.6, 82) * 1cqw, 86cqh * var(--ratio));
		}
	}
</style>
