<!--
	@component
	Desk view of a `gallery` block (`variant: 'desk'`): the photos lie scattered and overlapping on
	a table, each slightly rotated. Drag a photo to move it and uncover the ones below: it lifts and
	tilts in 3D with the speed of the move. Let go during a quick move and it is thrown: it slides
	on and slows down. Photos can leave the desk sideways, out of the screen (the band clips them);
	at the top and bottom they stay on the desk and bounce off its edges. Click a photo to drop it
	on the pile in the middle of the desk. The photo picked last is always on top. The button at the
	top right puts every photo back where it started.

	The desk fills the screen, and the page snaps to it when the scroll stops close by (proximity
	snap, so the text around scrolls freely). Out of focus it shows as a card, with the side
	margins and rounded corners of the big image (Figure); once it fills the screen it opens to the
	edges and the compact header slides up (immersive.svelte.js), until it scrolls away again. The first time it comes into view, the photos fly in
	from the sides one after the other and land in place; a desk already on screen when the page
	opens shows them in place.

	Positions are fractions of the free space around a photo (0–1 = on the desk; sideways, below 0
	or above 1 = off the desk), so the layout follows any desk size. The scatter is seeded by the
	image paths: the same on the server and in the browser, the same on every visit.

	Groups: gallery items can carry a `group` label (content). The labels sit at the middle left of
	the desk (at the bottom on phones), small and faded. Picking one sends the other photos off the
	desk, beyond their nearer side, and lines the group up in the middle: straight, in the order of
	the items, at one height, slightly overlapping (more when the desk is too narrow for them to
	stay readable), each one on the one before. Clicking a photo of the row brings it to the front;
	nothing can be dragged meanwhile. Picking the label again, Escape or the reset button puts the
	photos back where they were (reset: where they started).

	Keyboard: Enter / Space drops the focused photo on the pile, arrow keys move it (Shift: further)
	and bring it back on the desk if it was off; a focused photo shows above the others. Touch: a vertical swipe scrolls the page, other drags
	move the photo. Reduced motion: no snap, no arrival, no flight, no throw and no tilt.

	Settings: `tuning.desk` (`#lib/tuning/values.json`, live in the dev tuning panel): the grid, and
	`inertia` (share of the release speed kept, 0 = no throw), `friction` (1/s, higher = shorter
	slide), `bounce` (share of the speed kept off the top / bottom edge), `arrive` (arrival on or
	off), `arriveDuration` and `arriveStagger` (ms, flight of one photo and gap between two),
	`arriveScale` (size of the photos as they set off, 1 = their size on the desk). The card / full
	screen settings are in `tuning.immersive` (see immersive.svelte.js).
-->
<script>
	/** @import { GalleryItem, ImageRef, Theme } from '#lib/content/types.js' */
	import { prefersReducedMotion } from 'svelte/motion';
	import { MediaQuery, SvelteMap } from 'svelte/reactivity';
	import Picture from '#lib/components/ui/Picture.svelte';
	import { getPictures } from '#lib/content/context.js';
	import { untrack } from 'svelte';
	import { immersive, openTransition } from '#lib/components/layout/immersive.svelte.js';
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
	/** Share of the desk on screen that starts the arrival. */
	const ARRIVE_AT = 0.5;
	/** Share of the desk on screen to open full screen, and to close back to a card (a gap
	   between the two, so it does not flicker at the limit). */
	const FOCUS_IN = 0.9;
	const FOCUS_OUT = 0.75;
	/** Lined-up group: room left free at each end of the row (share of the desk width), slight
	   overlap (share of a photo's width under the next one), tallest photo (share of the desk
	   height), px between the group labels and the row. */
	const ROW_MARGIN = 0.03;
	const ROW_OVERLAP = 0.1;
	const ROW_HEIGHT = 0.6;
	const ROW_GAP = 24;
	/** Smallest width of the widest photo of the row: px, but at most a share of the row (on
	   phones: always that share). When the slight overlap would make the photos narrower (many
	   photos, phone), they overlap more instead. */
	const ROW_MIN_WIDTH = 220;
	const ROW_MIN_SHARE = 0.75;

	const lookup = getPictures();
	const uid = $props.id();
	const hint = `${uid}-hint`;
	const groupHint = `${uid}-group-hint`;

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

	/** @type {HTMLElement | undefined} */
	let deskElement = $state();

	/** Group labels, in the order of their first photo. */
	const groups = $derived([...new Set(items.flatMap((item) => (item.group ? [item.group] : [])))]);

	/** Group lined up in the middle, null = the photos lie on the desk. Back to the desk when
	   other items come in. */
	let active = $derived.by(() => {
		void items;
		return /** @type {string | null} */ (null);
	});

	/** Indices of the photos of the shown group, in the order of the items. */
	const members = $derived(
		active === null ? [] : items.flatMap((item, i) => (item.group === active ? [i] : []))
	);

	/** Photo of the row brought to the front, -1 = none (each one lies on the one before). */
	let raised = $state(-1);

	/** Phones: the labels sit at the bottom of the desk instead of the middle left. */
	const narrow = new MediaQuery('max-width: 767px');

	/** @type {HTMLElement | undefined} */
	let labelsElement = $state();

	/** Desk surface in px, and width the labels take on its left (the row keeps clear of them,
	   on both sides so it stays centred). */
	let room = $state({ width: 0, height: 0, labels: 0 });

	$effect(() => {
		if (!surface) return;
		const target = surface;
		const labels = labelsElement;
		const aside = !narrow.current;
		const observer = new ResizeObserver(() => {
			room = {
				width: target.clientWidth,
				height: target.clientHeight,
				// Both offsets are from the desk: the labels' right edge, from the surface's left edge.
				labels:
					labels && aside
						? labels.offsetLeft + labels.offsetWidth - target.offsetLeft + ROW_GAP
						: 0
			};
		});
		observer.observe(target);
		if (labels) observer.observe(labels);
		return () => observer.disconnect();
	});

	/**
	 * The shown group in a row, by index: top-left corner and width in px (one height for all),
	 * stacking order. Sized for a slight overlap; when that would make the photos too small,
	 * they keep a minimum size and overlap more.
	 */
	const row = $derived.by(() => {
		/** @type {Map<number, { x: number, y: number, w: number, z: number }>} */
		const layout = new Map();
		const count = members.length;
		if (!count || !room.width) return layout;
		const ratios = members.map((i) => {
			const { img } = lookup(items[i].image);
			return img.w / img.h;
		});
		const space = (room.width - 2 * room.labels) * (1 - 2 * ROW_MARGIN);
		const tallest = room.height * ROW_HEIGHT;
		const last = ratios[count - 1];
		// Widths of the photos before the last one, per px of height.
		const lead = ratios.slice(0, -1).reduce((sum, ratio) => sum + ratio, 0);
		let step = 1 - ROW_OVERLAP;
		let height = Math.min(tallest, space / (lead * step + last));
		const widest = narrow.current
			? space * ROW_MIN_SHARE
			: Math.min(ROW_MIN_WIDTH, space * ROW_MIN_SHARE);
		const least = Math.min(tallest, widest / Math.max(...ratios));
		if (height < least) {
			height = least;
			step = lead > 0 ? clamp((space / height - last) / lead, 0, step) : step;
		}
		let x = (room.width - (lead * step + last) * height) / 2;
		const y = (room.height - height) / 2;
		members.forEach((i, k) => {
			const w = ratios[k] * height;
			layout.set(i, { x, y, w, z: top + 1 + (i === raised ? count : k) });
			x += w * step;
		});
		return layout;
	});

	/** Highest stacking order on the desk (a focused photo shows above it). */
	const front = $derived(active === null ? top : top + 1 + members.length);

	/**
	 * Arrival of the photos: 'idle' = in place (server render, no JS, desk seen on load, after the
	 * arrival), 'away' = off the screen until the desk comes into view, 'arriving' = flying in.
	 * @type {'idle' | 'away' | 'arriving'}
	 */
	let arrival = $state('idle');
	let arrivalTimer = 0;

	$effect(() => {
		if (!deskElement || !tuning.desk.arrive || prefersReducedMotion.current) return;
		let first = true;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (first) {
					first = false;
					// On screen as the page opens: no photo jumps away under the eyes.
					if (entry.isIntersecting) observer.disconnect();
					else arrival = 'away';
					return;
				}
				if (entry.intersectionRatio < ARRIVE_AT) return;
				observer.disconnect();
				arrive();
			},
			{ threshold: [0, ARRIVE_AT] }
		);
		observer.observe(deskElement);
		return () => observer.disconnect();
	});

	$effect(() => () => clearTimeout(arrivalTimer));

	/** Fills the screen: open to the edges, header away. */
	let focused = $state(false);

	$effect(() => {
		if (!deskElement) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.intersectionRatio >= FOCUS_IN) focused = true;
				else if (entry.intersectionRatio < FOCUS_OUT) focused = false;
			},
			{ threshold: [FOCUS_OUT, FOCUS_IN] }
		);
		observer.observe(deskElement);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!focused) return;
		untrack(() => immersive.count++);
		return () => untrack(() => immersive.count--);
	});

	function arrive() {
		arrival = 'arriving';
		const { arriveDuration, arriveStagger } = tuning.desk;
		clearTimeout(arrivalTimer);
		arrivalTimer = window.setTimeout(
			() => (arrival = 'idle'),
			arriveDuration + arriveStagger * (items.length - 1) + 100
		);
	}

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

	/** Every photo back where it started (they fly there unless motion is reduced). */
	function reset() {
		glides.clear();
		tilts = {};
		active = null;
		raised = -1;
		places = scatter(items);
	}

	/** Stops every move (drag, slide, arrival) before the photos line up or go back. */
	function settle() {
		cancelAnimationFrame(frame);
		frame = 0;
		glides.clear();
		tilts = {};
		endDrag();
		if (arrival !== 'idle') {
			clearTimeout(arrivalTimer);
			arrival = 'idle';
		}
	}

	/**
	 * Lines up a group, or puts the photos back on the desk when it is already shown.
	 * @param {string} group
	 */
	function pick(group) {
		settle();
		active = active === group ? null : group;
		raised = -1;
	}

	/** @param {KeyboardEvent} event */
	function onescape(event) {
		if (event.key !== 'Escape' || active === null) return;
		event.preventDefault();
		active = null;
		raised = -1;
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
			const x = places[i].x + (rangeX > 0 ? (speed.x * dt) / rangeX : 0);
			let y = places[i].y + (rangeY > 0 ? (speed.y * dt) / rangeY : 0);
			// Sideways it may fly off; past the top or bottom edge: back on the desk, bounced.
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
		// A lined-up group stays in its row.
		if (active !== null || !event.isPrimary || event.button !== 0 || !surface) return;
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
		// Free sideways (off the desk, out of the screen), held on the desk vertically.
		update(pointer.index, {
			x: rangeX > 0 ? from.x + dx / rangeX : from.x,
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
		if (active !== null) raised = i;
		else pile(i);
	}

	/**
	 * @param {KeyboardEvent} event
	 * @param {number} i
	 */
	function onkeydown(event, i) {
		if (active !== null) return onescape(event);
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
	class={['desk', focused && 'focused']}
	data-desk
	data-surface={theme}
	bind:this={deskElement}
	style={openTransition()}
	style:--card-margin="calc(var(--margin) * {tuning.immersive.cardMargin / 20})"
	style:--card-scale={tuning.immersive.cardScale}
	style:--desk-bg={desk.background}
	style:--grid-size={desk.spacing}
	style:--grid-line="{desk.lineWidth}px"
	style:--grid-color={gridColor}
>
	<p class="sr-only" id={hint}>{site.labels.deskHint}</p>
	<button
		type="button"
		class="reset"
		aria-label={site.labels.deskReset}
		title={site.labels.deskReset}
		onclick={reset}
	>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8.27" />
			<path d="M3 3v5.27h5.27" />
		</svg>
	</button>
	{#if groups.length}
		<p class="sr-only" id={groupHint}>{site.labels.deskGroupHint}</p>
		<ul class="groups" aria-label={site.labels.deskGroups} bind:this={labelsElement}>
			{#each groups as group (group)}
				<li>
					<button
						type="button"
						class="group"
						aria-pressed={active === group}
						onclick={() => pick(group)}
						onkeydown={onescape}
					>
						{group}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
	<ul
		class={['surface', arrival !== 'idle' && arrival]}
		aria-label={site.labels.desk}
		style:--size={size}
		style:--top={front}
		style:--arrive-duration="{desk.arriveDuration}ms"
		style:--arrive-scale={desk.arriveScale}
		bind:this={surface}
	>
		{#each items as item, i (item.image)}
			{@const place = places[i]}
			{@const picture = lookup(item.image)}
			{@const slot = row.get(i)}
			{@const out = active !== null && item.group !== active}
			<li
				class={[
					'photo',
					dragging === i && 'dragging',
					glides.has(i) && 'gliding',
					slot && 'lined',
					out && 'out'
				]}
				inert={out}
				style:--x={place.x}
				style:--y={place.y}
				style:--r="{place.r}deg"
				style:--z={slot?.z ?? place.z}
				style:--row-x={slot && `${slot.x}px`}
				style:--row-y={slot && `${slot.y}px`}
				style:--row-w={slot && `${slot.w}px`}
				style:--ratio={picture.img.w / picture.img.h}
				style:--tilt-x="{tilts[i]?.x ?? 0}deg"
				style:--tilt-y="{tilts[i]?.y ?? 0}deg"
				style:--from={place.x < 0.5 ? -1 : 1}
				style:--delay="{i * desk.arriveStagger}ms"
			>
				<button
					type="button"
					class="handle"
					aria-describedby={active === null ? hint : groupHint}
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
						sizes="(max-width: 767px) 82vw, {Math.ceil(
							Math.max(size, slot && room.width ? (slot.w / room.width) * 100 : 0)
						)}vw"
						priority={priority && i === 0}
					/>
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	/* Full screen, with a grid centred on it (one line on the left and top edge of each cell).
	   Out of focus: a card, clipped to the side margins and corners of the big image and slightly
	   scaled down; in focus: open to the edges, full size. The clip and scale do not move the
	   layout, so the photos stay put. Photos thrown sideways leave through the edges of the screen
	   without making the page scroll sideways. */
	.desk {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100svh;
		overflow-x: clip;
		padding: var(--margin);
		clip-path: inset(0 var(--card-margin) round var(--radius-screen));
		scale: var(--card-scale);
		transition:
			clip-path var(--open-duration) var(--open-ease),
			scale var(--open-duration) var(--open-ease);
		scroll-snap-align: start;
		background-image:
			linear-gradient(to right, var(--grid-color) var(--grid-line), transparent 0),
			linear-gradient(to bottom, var(--grid-color) var(--grid-line), transparent 0);
		background-size: calc(var(--grid-size) * var(--u)) calc(var(--grid-size) * var(--u));
		background-position: center;
	}

	.focused {
		clip-path: inset(0 round 0);
		scale: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.desk {
			transition: none;
		}
	}

	[data-surface='white'] {
		background-color: var(--desk-bg);
	}

	/* Snap to the desk when the scroll stops near it (proximity: the rest of the page scrolls
	   freely). Not with reduced motion: the page would move by itself. */
	:global(html:has([data-desk])) {
		scroll-snap-type: y proximity;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html:has([data-desk])) {
			scroll-snap-type: none;
		}
	}

	/* Chapter pages keep anchors below the fixed header (global.css): the desk snaps under it. */
	:global([data-layout='chapter']) .desk {
		scroll-margin-top: calc(-1 * var(--header-h));
	}

	/* Top right of the desk, above the photos (they stack inside the surface). */
	.reset {
		position: absolute;
		top: calc(var(--margin) + var(--space-20));
		right: calc(var(--margin) + var(--space-20));
		z-index: 1;
		display: grid;
		place-items: center;
		width: var(--mark-size);
		height: var(--mark-size);
		border-radius: 50%;
		color: var(--color-paper);
		background: var(--color-ink);
		box-shadow: var(--shadow-photo);
	}

	.reset svg {
		width: 50%;
		height: 50%;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: rotate var(--duration-fade) var(--ease-fade);
	}

	@media (hover: hover) {
		.reset:hover svg {
			rotate: -90deg;
		}
	}

	/* Group labels: middle left of the desk, small and faded (the page's muted grey, ≥ 4.5:1),
	   the shown group in full ink and underlined (on orange the grey is close to the ink). Above
	   the photos, like the reset button. */
	.groups {
		position: absolute;
		top: 50%;
		left: calc(var(--margin) + var(--space-20));
		z-index: 1;
		translate: 0 -50%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.group {
		display: block;
		min-height: 24px; /* WCAG 2.5.8 target size */
		padding-block: 0.15em;
		font-size: var(--type-small);
		line-height: var(--leading-body);
		text-align: left;
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

	/* Phones: a line at the bottom left, so the row has the whole width. */
	@media (max-width: 767px) {
		.groups {
			top: auto;
			bottom: calc(var(--margin) + var(--space-20));
			right: calc(var(--margin) + var(--space-20));
			translate: none;
			flex-flow: row wrap;
			column-gap: 1em;
		}
	}

	/* Its own stacking context: the photos' z-indexes stay inside, under the labels and the reset
	   button (container-type alone does not create one). */
	.surface {
		position: relative;
		isolation: isolate;
		flex: 1;
		min-height: 0;
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
		translate: calc(var(--x) * (100cqw - var(--photo-w)) + var(--off, 0) * 100cqw)
			calc(var(--y) * (100cqh - var(--photo-w) / var(--ratio)));
		rotate: calc(var(--r) + var(--spin, 0deg));
		scale: var(--drop, 1);
		transition:
			translate var(--duration-slide) var(--ease-slide),
			rotate var(--duration-slide) var(--ease-slide),
			width var(--duration-slide) var(--ease-slide);
	}

	/* Lined-up group: straight, at the place and width of the row (px, see `row`). */
	.photo.lined {
		width: var(--row-w);
		translate: var(--row-x) var(--row-y);
		rotate: 0deg;
	}

	/* Not in the shown group: off the desk, beyond the nearer side, turned as before the arrival. */
	.photo.out {
		--off: calc(var(--from) * 1.3);
		--spin: calc(var(--from) * 24deg);
	}

	/* Before the arrival: beyond the nearer side of the screen (1.3 desk widths away), turned
	   further and scaled (larger = as if held above the desk). */
	.away .photo {
		--off: calc(var(--from) * 1.3);
		--spin: calc(var(--from) * 24deg);
		--drop: var(--arrive-scale);
		transition: none;
	}

	/* Arrival: one after the other, bottom photo first. */
	.arriving .photo {
		transition:
			translate var(--arrive-duration) var(--ease-arrive) var(--delay),
			rotate var(--arrive-duration) var(--ease-arrive) var(--delay),
			scale var(--arrive-duration) var(--ease-arrive) var(--delay);
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

	/* In the row a click brings the photo to the front; nothing is dragged. */
	.lined .handle {
		cursor: pointer;
	}

	@media (max-width: 767px) {
		.photo {
			--photo-w: min(min(var(--size) * 1.6, 82) * 1cqw, 86cqh * var(--ratio));
		}
	}
</style>
