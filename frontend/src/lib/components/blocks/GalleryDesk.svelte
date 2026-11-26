<!--
	@component
	Desk view of a `gallery` block (`variant: 'desk'`): the photos lie scattered and overlapping on
	a table, each slightly rotated. Drag a photo to move it and uncover the ones below: it lifts and
	tilts in 3D with the speed of the move. Let go during a quick move and it is thrown: it slides
	on and slows down. Photos can leave the desk sideways, out of the screen (the band clips them);
	at the top and bottom they stay on the desk and bounce off its edges. Click a photo to drop it
	on the pile in the middle of the desk (a moment later, in case it is a double click: zoom).
	The photo picked last is always on top; with a mouse, so is the photo under the pointer: it
	comes on top as the pointer enters it, and stays there (not for a moment after a click or a
	zoom, so a neighbour never covers the photo being double clicked or going back). The button at
	the top right puts every photo back where it started.

	The desk fills the screen, and the page snaps to it when the scroll stops close by (proximity
	snap, so the text around scrolls freely; never while the page is at its top, Martial). Out of focus it shows as a card, with the side
	margins and rounded corners of the big image (Figure), sunk into the page by an inner shadow;
	once it fills the screen it opens to the edges, the shadow fades out (the desk rises flush with
	the page) and the compact header slides up (immersive.svelte.js), until it scrolls away again.
	While it scrolls, its grid and photos move slightly slower than the page (parallax), and line up
	with it when the desk fills the screen. The first time it comes into view, the photos fly in
	from the sides one after the other and land in place; a desk already on screen when the page
	opens shows them in place.

	Positions are fractions of the free space around a photo (0–1 = on the desk; sideways, below 0
	or above 1 = off the desk), so the layout follows any desk size. The scatter is seeded by the
	image paths: the same on the server and in the browser, the same on every visit.

	Groups: gallery items can carry a `group` label (content: copied from the students' material,
	docs/desk-legends.md). The labels sit at the middle left of the desk (at the bottom on phones),
	as chips like the chapter navigation. They come in one after the other, growing
	slightly as they fade in: once the last photo of the arrival has set off, or just after the page
	opens when the desk is already in place (`tuning.desk.labels…`). Picking one sends the
	other photos off the desk, beyond their nearer side, and lines the group up in the middle:
	straight, in the order of the items, at one height, slightly overlapping (more when the desk
	is too narrow for them to stay readable), each one on the one before. Clicking a photo of the
	row brings it to the front; dragging it (thrown like on the desk) or the arrow keys move it
	off its place, still straight (Martial). Picking the label again, Escape or the reset button
	puts the photos back where they were on the desk (reset: where they started); the moves made
	in the row are not kept.

	Videos (`{ video }` items): they lie on the desk among the photos, as their poster frame with
	a round play mark, and move like them. Clicking one (Enter / Space) brings it on top and plays
	it where it lies, or pauses it; no native controls, they would get in the way of the drag. A
	thin line along the bottom shows how far it has played. One plays at a time; a video sent off
	the desk by a group, or the whole desk leaving the screen, pauses.

	Zoom (Martial): under the pointer, or with the keyboard focus, a small icon shows at the bottom
	right of a photo (or video), without background, white in difference mode (black on light
	parts, white on dark ones); it lifts and tilts with the photo, so it stays on its corner. It enlarges the photo, straight, in the middle of the desk,
	above everything else. A click anywhere outside it, Escape or the button again puts it back
	where it was, at its size. A double click on a photo zooms it too (the first click is undone:
	no trip to the pile, a video keeps playing or stays paused), and a double click on the zoomed
	photo puts it back. The second click counts for the photo of the first one even if it lands
	on a neighbour (the hand moved, or the photo set off for the pile). On touch screens the button shows on the photo touched last.

	Keyboard: Enter / Space drops the focused photo on the pile, arrow keys move it (Shift: further)
	and bring it back on the desk if it was off; a focused photo shows above the others. Touch: a vertical swipe scrolls the page, other drags
	move the photo. Reduced motion: no snap, no parallax, no arrival, no flight, no throw and no
	tilt.

	Settings: `tuning.desk` (`#lib/tuning/values.json`, live in the dev tuning panel): the grid, and
	`inertia` (share of the release speed kept, 0 = no throw), `friction` (1/s, higher = shorter
	slide), `bounce` (share of the speed kept off the top / bottom edge), `arrive` (arrival on or
	off), `arriveDuration` and `arriveStagger` (ms, flight of one photo and gap between two),
	`arriveScale` (size of the photos as they set off, 1 = their size on the desk), `labelsDelay`
	(ms after the last photo set off, or after the page opened), `labelsDuration` and
	`labelsStagger` (ms, entrance of one label and gap between two), `labelsScale` (size of the
	labels as they come in, 1 = their size). The card / full screen settings are in
	`tuning.immersive` (see immersive.svelte.js).
-->
<script>
	/** @import { GalleryItem, Theme } from '#lib/content/types.js' */
	import { prefersReducedMotion } from "svelte/motion";
	import { MediaQuery, SvelteMap, SvelteSet } from "svelte/reactivity";
	import Picture from "#lib/components/ui/Picture.svelte";
	import VideoClip from "#lib/components/ui/VideoClip.svelte";
	import { getPictures } from "#lib/content/context.js";
	import { untrack } from "svelte";
	import {
		immersive,
		openTransition,
		scrolled,
	} from "#lib/components/layout/immersive.svelte.js";
	import { site } from "#lib/content/site.js";
	import { tuning } from "#lib/tuning/tuning.svelte.js";

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
	/** Zoomed photo: as large as fits this share of the desk width and height. */
	const ZOOM_SHARE = 0.92;

	const lookup = getPictures();
	const uid = $props.id();
	const hint = `${uid}-hint`;
	const videoHint = `${uid}-video-hint`;
	const groupHint = `${uid}-group-hint`;

	/**
	 * Identity of an item (each key, scatter seed): its image, or its video file.
	 * @param {GalleryItem} item
	 */
	const keyOf = (item) => item.video?.src ?? item.image;

	/**
	 * Width / height of an item.
	 * @param {GalleryItem} item
	 */
	function ratioOf(item) {
		if (item.video) return item.video.width / item.video.height;
		const { img } = lookup(item.image);
		return img.w / img.h;
	}

	/** Videos playing, by index (one at a time, but the events may overlap), and how far each
	   one has played (0–1), once started. */
	/** @type {SvelteSet<number>} */
	const playing = new SvelteSet();
	/** @type {Record<number, number>} */
	let progress = $state({});

	/** Photo width in % of the desk width: large for a few photos, smaller for many. */
	const size = $derived(
		Math.min(60, 22 + 40 / Math.sqrt(Math.max(1, items.length))),
	);

	/**
	 * Grid drawn on the desk, `tuning.desk` (`#lib/tuning/values.json`, live in the dev tuning
	 * panel): spacing in Figma px at 1728 (fluid like the rest), line width in px, line colour +
	 * opacity, background of the desk on white pages (orange pages keep the page colour).
	 */
	const desk = $derived(tuning.desk);
	const gridColor = $derived(
		desk.grid
			? `color-mix(in srgb, ${desk.lineColor} ${desk.lineOpacity * 100}%, transparent)`
			: "transparent",
	);

	/** Back to the scatter when other items come in. */
	let places = $derived(scatter(items));

	const top = $derived(Math.max(0, ...places.map((place) => place.z)));


	/** Index of the photo being dragged, -1 when none. */
	let dragging = $state(-1);

	/** @typedef {{ x: number, y: number }} Vector */

	/** Range of a shift up and down (px): the photo of the row stays on the desk vertically. */
	/** @typedef {{ min: number, max: number }} Bounds */

	/** Thrown photos while they slide, by index: velocity in px/ms, free space in px; in the row,
	   the vertical range of their shift instead. */
	/** @type {SvelteMap<number, { velocity: Vector, rangeX: number, rangeY: number, lined?: Bounds }>} */
	const glides = new SvelteMap();

	/** Photos of the shown group moved off their place in the row (dragged, thrown, arrow keys):
	   px from it, by index. Cleared when the photos go back on the desk or another group shows. */
	/** @type {Record<number, Vector>} */
	let shifts = $state({});

	/** 3D tilt of the moving photos (dragged or sliding), in degrees, by index. */
	/** @type {Record<number, Vector>} */
	let tilts = $state({});

	/** @type {HTMLElement | undefined} */
	let surface = $state();

	/** @type {HTMLElement | undefined} */
	let deskElement = $state();

	/** Group labels, in the order of their first photo. */
	const groups = $derived([
		...new Set(items.flatMap((item) => (item.group ? [item.group] : []))),
	]);

	/** Group lined up in the middle, null = the photos lie on the desk. Back to the desk when
	   other items come in. */
	let active = $derived.by(() => {
		void items;
		return /** @type {string | null} */ (null);
	});

	/** Indices of the photos of the shown group, in the order of the items. */
	const members = $derived(
		active === null
			? []
			: items.flatMap((item, i) => (item.group === active ? [i] : [])),
	);

	/** Photo of the row brought to the front, -1 = none (each one lies on the one before). */
	let raised = $state(-1);

	/** Where the photos start, to tell when the desk has been changed. */
	const original = $derived(scatter(items));

	/** A photo moved, turned or changed order, or a group is shown: the reset button shows. */
	const changed = $derived(
		active !== null ||
			places.some(
				(place, i) =>
					place.x !== original[i].x ||
					place.y !== original[i].y ||
					place.r !== original[i].r ||
					place.z !== original[i].z,
			),
	);

	/** Phones: the labels sit at the bottom of the desk instead of the middle left. */
	const narrow = new MediaQuery("max-width: 767px");

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
						? labels.offsetLeft +
							labels.offsetWidth -
							target.offsetLeft +
							ROW_GAP
						: 0,
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
		const ratios = members.map((i) => ratioOf(items[i]));
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

	/** Photo enlarged in the middle of the desk, -1 = none. None when other items come in. */
	let zoomed = $derived.by(() => {
		void items;
		return -1;
	});

	/** Photo touched last: on touch screens (no hover), its zoom button shows. */
	let current = $state(-1);

	/** The zoomed photo, centred: top-left corner and width in px. */
	const zoom = $derived.by(() => {
		if (zoomed === -1 || !room.width) return null;
		const ratio = ratioOf(items[zoomed]);
		const w = Math.min(
			room.width * ZOOM_SHARE,
			room.height * ZOOM_SHARE * ratio,
		);
		return { x: (room.width - w) / 2, y: (room.height - w / ratio) / 2, w };
	});

	/**
	 * Arrival of the photos: 'idle' = in place (server render, no JS, desk seen on load, after the
	 * arrival), 'away' = off the screen until the desk comes into view, 'arriving' = flying in.
	 * @type {'idle' | 'away' | 'arriving'}
	 */
	let arrival = $state("idle");
	let arrivalTimer = 0;

	/** Start of the labels' entrance, in ms before `labelsDelay`: 0 as the page opens, the moment
	   the last photo sets off once the desk arrives. Kept after the arrival, so the labels do not
	   jump back into their entrance when it ends. */
	let labelsStart = $state(0);

	$effect(() => {
		if (!deskElement || !tuning.desk.arrive || prefersReducedMotion.current)
			return;
		let first = true;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (first) {
					first = false;
					// On screen as the page opens: no photo jumps away under the eyes.
					if (entry.isIntersecting) observer.disconnect();
					else arrival = "away";
					return;
				}
				if (entry.intersectionRatio < ARRIVE_AT) return;
				observer.disconnect();
				arrive();
			},
			{ threshold: [0, ARRIVE_AT] },
		);
		observer.observe(deskElement);
		return () => observer.disconnect();
	});

	$effect(() => () => clearTimeout(arrivalTimer));
	$effect(() => () => clearTimeout(pending?.timer));

	/** Fills the screen: open to the edges, header away. */
	let focused = $state(false);

	/** A snap point only once the page has left its top (see `scrolled`). */
	const snaps = $derived(scrolled.current);

	$effect(() => {
		if (!deskElement) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.intersectionRatio >= FOCUS_IN) focused = true;
				else if (entry.intersectionRatio < FOCUS_OUT) focused = false;
				// Off the screen: no video keeps playing out of sight (it has no controls), and a
				// zoomed photo goes back on the desk.
				if (!entry.isIntersecting) {
					pauseAll();
					zoomed = -1;
				}
			},
			{ threshold: [0, FOCUS_OUT, FOCUS_IN] },
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
		arrival = "arriving";
		const { arriveDuration, arriveStagger } = tuning.desk;
		labelsStart = arriveStagger * (items.length - 1);
		clearTimeout(arrivalTimer);
		arrivalTimer = window.setTimeout(
			() => (arrival = "idle"),
			arriveDuration + arriveStagger * (items.length - 1) + 100,
		);
	}

	/**
	 * Press on a photo. On the desk it moves its place (`from`, fractions of `rangeX` / `rangeY`);
	 * in the row, its shift (`shift`, px, vertical range `lined`).
	 * @type {{ id: number, index: number, x: number, y: number, from: Place, rangeX: number,
	 *   rangeY: number, shift: Vector, lined: Bounds | null } | null}
	 */
	let pointer = null;

	/** A drag just ended: the click that follows it must not send the photo to the pile. */
	let dragged = false;

	/**
	 * Last single click on a photo: the photo, where it lay before it (a double click undoes the
	 * click before zooming), when and where it happened, and its handle (to play a video back).
	 * Any other single click, anywhere, clears it.
	 * @type {{ index: number, place: Place, time: number, x: number, y: number, handle: HTMLButtonElement } | null}
	 */
	let clicked = null;

	/**
	 * A clicked photo goes to the pile this long after the click (ms): a second click in the
	 * meantime makes it a double click (zoom), and the photo has not moved away from under the
	 * pointer.
	 */
	const PILE_DELAY = 300;

	/**
	 * After a click, how long (ms) and how close (px) a second press may come and still be the
	 * second click of a double click (usual system values).
	 */
	const DOUBLE_CLICK_TIME = 500;
	const DOUBLE_CLICK_DISTANCE = 8;

	/** How long (ms) the photos keep their order once the zoom changes (the slide, and a margin). */
	const ZOOM_CALM = 500;

	/**
	 * Until this event time (ms), the pointer passing over a photo does not bring it on top: just
	 * after a click (it may be the first of a double click), and while a photo zooms in or goes
	 * back to its place (the pointer ends up over a neighbour, which must not cover it).
	 */
	let calmUntil = 0;

	$effect(() => {
		void zoomed;
		calmUntil = performance.now() + ZOOM_CALM;
	});

	/** @type {{ index: number, timer: ReturnType<typeof setTimeout> } | null} */
	let pending = null;

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
			shifts = {};
			playing.clear();
			progress = {};
		};
	});

	// Sent off the desk by a group: their videos pause (after the update, once `.out` is set).
	$effect(() => {
		if (active === null || !surface) return;
		for (const video of surface.querySelectorAll(".out video"))
			/** @type {HTMLVideoElement} */ (video).pause();
	});

	function pauseAll() {
		for (const video of surface?.querySelectorAll("video") ?? []) video.pause();
	}

	/**
	 * Plays the video in a handle, or pauses it. Only one plays at a time.
	 * @param {HTMLElement} handle
	 */
	function toggle(handle) {
		const video = handle.querySelector("video");
		if (!video) return;
		if (!video.paused) return video.pause();
		pauseAll();
		// Refused (autoplay policy, missing file): it stays on its poster.
		video.play().catch(() => {});
	}

	/**
	 * @param {Event & { currentTarget: HTMLVideoElement }} event
	 * @param {number} i
	 */
	function ontimeupdate(event, i) {
		const { currentTime, duration } = event.currentTarget;
		if (duration > 0) progress[i] = currentTime / duration;
	}

	/**
	 * @param {number} value
	 * @param {number} [min]
	 * @param {number} [max]
	 */
	const clamp = (value, min = 0, max = 1) =>
		Math.min(max, Math.max(min, value));

	/** @param {string} text */
	function hash(text) {
		let h = 2166136261;
		for (let i = 0; i < text.length; i++)
			h = Math.imul(h ^ text.charCodeAt(i), 16777619);
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
	 * @param {GalleryItem[]} items
	 * @returns {Place[]}
	 */
	function scatter(items) {
		const random = seeded(hash(items.map(keyOf).join("|")));
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
				z: i + 1,
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
			z: above(i),
		});
	}

	/** Reset icon turning (one turn each time the pointer comes over it). */
	let spinning = $state(false);

	/** Every photo back where it started (they fly there unless motion is reduced). */
	function reset() {
		glides.clear();
		tilts = {};
		zoomed = -1;
		active = null;
		raised = -1;
		shifts = {};
		places = scatter(items);
	}

	/** Stops every move (drag, slide, arrival, pile move waiting) before the photos line up or go back. */
	function settle() {
		flushPending(false);
		cancelAnimationFrame(frame);
		frame = 0;
		glides.clear();
		tilts = {};
		endDrag();
		if (arrival !== "idle") {
			clearTimeout(arrivalTimer);
			arrival = "idle";
		}
	}

	/**
	 * Lines up a group, or puts the photos back on the desk when it is already shown.
	 * @param {string} group
	 */
	function pick(group) {
		settle();
		zoomed = -1;
		active = active === group ? null : group;
		raised = -1;
		shifts = {};
	}

	/**
	 * Enlarges photo `i` in the middle of the desk, or puts it back when it already is.
	 * @param {number} i
	 */
	function toggleZoom(i) {
		if (zoomed === i) {
			zoomed = -1;
			return;
		}
		settle();
		zoomed = i;
		current = i;
	}

	/** Escape: the zoomed photo goes back first, then a shown group. @param {KeyboardEvent} event */
	function onescape(event) {
		if (event.key !== "Escape") return;
		if (zoomed !== -1) {
			event.preventDefault();
			zoomed = -1;
			return;
		}
		if (active === null) return;
		event.preventDefault();
		settle();
		active = null;
		raised = -1;
		shifts = {};
	}

	/**
	 * A click outside the desk puts the zoomed photo back (inside, the veil under it does).
	 * @param {MouseEvent} event
	 */
	function onwindowclick(event) {
		if (zoomed === -1 || !deskElement) return;
		if (!deskElement.contains(/** @type {Node} */ (event.target))) zoomed = -1;
	}

	/**
	 * Escape with the focus outside the desk (or on nothing) puts the zoomed photo back too.
	 * @param {KeyboardEvent} event
	 */
	function onwindowkeydown(event) {
		if (event.key !== "Escape" || zoomed === -1 || event.defaultPrevented)
			return;
		event.preventDefault();
		zoomed = -1;
	}

	/**
	 * Vertical range of the shift of photo `i` in the row: its top edge from the desk's top to
	 * the bottom (minus its height). Sideways it is free, as on the desk.
	 * @param {number} i
	 * @returns {Bounds | null}  null: not in the row
	 */
	function rowBounds(i) {
		const slot = row.get(i);
		if (!slot) return null;
		const height = slot.w / ratioOf(items[i]);
		return { min: -slot.y, max: room.height - height - slot.y };
	}

	/**
	 * The leading edge sinks: rotateY(+) sends the right edge back, rotateX(-) the bottom edge.
	 * @param {Vector} speed  px/ms
	 * @returns {Vector}
	 */
	const tiltOf = (speed) => ({
		x: clamp(-speed.y * TILT_PER_SPEED, -TILT_MAX, TILT_MAX),
		y: clamp(speed.x * TILT_PER_SPEED, -TILT_MAX, TILT_MAX),
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
			const { velocity: speed, rangeX, rangeY, lined } = glide;
			if (lined) {
				// In the row: px off its place, the same way.
				const shift = shifts[i] ?? { x: 0, y: 0 };
				let y = shift.y + speed.y * dt;
				if (y < lined.min || y > lined.max) {
					y = clamp(y, lined.min, lined.max);
					speed.y *= -bounce;
				}
				shifts[i] = { x: shift.x + speed.x * dt, y };
			} else {
				const x = places[i].x + (rangeX > 0 ? (speed.x * dt) / rangeX : 0);
				let y = places[i].y + (rangeY > 0 ? (speed.y * dt) / rangeY : 0);
				// Sideways it may fly off; past the top or bottom edge: back on the desk, bounced.
				if (y < 0 || y > 1) {
					y = clamp(y);
					speed.y *= -bounce;
				}
				update(i, { x, y });
			}
			speed.x *= keep;
			speed.y *= keep;
			if (Math.hypot(speed.x, speed.y) < GLIDE_STOP) glides.delete(i);
			else next[i] = tiltOf(speed);
		}

		tilts = next;
		frame =
			dragging !== -1 || glides.size > 0 ? requestAnimationFrame(tick) : 0;
	}

	/**
	 * Pointer speed over the end of the drag, in px/ms; none if the pointer stood still.
	 * @param {number} time  release time
	 * @returns {Vector}
	 */
	function releaseSpeed(time) {
		const first = samples[0];
		const last = samples.at(-1);
		if (!first || !last || time - last.time > THROW_STILL)
			return { x: 0, y: 0 };
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
		// The second press of a double click that landed on a neighbour (the hand moved a little,
		// or the photo set off for the pile): the double click zooms the first photo
		// (onwindowclickcapture); this one does not move or come on top.
		if (
			clicked &&
			clicked.index !== i &&
			event.timeStamp - clicked.time < DOUBLE_CLICK_TIME &&
			Math.hypot(event.clientX - clicked.x, event.clientY - clicked.y) <
				DOUBLE_CLICK_DISTANCE
		)
			return;
		// A pile move still waiting: dropped if this photo is pressed again (a double click, or
		// a drag that takes over), made now for another one.
		flushPending(pending?.index !== i);
		current = i;
		// The zoomed photo stays put.
		if (i === zoomed) return;
		if (!event.isPrimary || event.button !== 0 || !surface) return;
		// A shown group: its photos move off their place in the row (the others are off the desk).
		const lined = rowBounds(i);
		if (active !== null && !lined) return;
		// Caught while sliding: it stops under the pointer.
		glides.delete(i);
		const photo = /** @type {HTMLElement} */ (
			event.currentTarget.closest(".photo")
		);
		pointer = {
			id: event.pointerId,
			index: i,
			x: event.clientX,
			y: event.clientY,
			from: places[i],
			rangeX: surface.clientWidth - photo.offsetWidth,
			rangeY: surface.clientHeight - photo.offsetHeight,
			shift: shifts[i] ?? { x: 0, y: 0 },
			lined,
		};
		velocity = { x: 0, y: 0 };
		samples = [{ x: event.clientX, y: event.clientY, time: event.timeStamp }];
		if (lined) raised = i;
		else update(i, { z: above(i) });
	}

	/**
	 * Mouse (or pen) over a photo: it comes on top of the pile and stays there once the pointer
	 * leaves (in a row: to the front). Touch raises it on pointerdown instead; nothing changes
	 * while a photo is held, nor for a moment after a click or a zoom (`calmUntil`).
	 * @param {PointerEvent} event
	 * @param {number} i
	 */
	function onpointerenter(event, i) {
		if (event.pointerType === "touch" || pointer || i === zoomed) return;
		if (event.timeStamp < calmUntil) return;
		if (active !== null) {
			if (row.has(i)) raised = i;
			return;
		}
		if (places[i].z !== top) update(i, { z: above(i) });
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

		const { from, rangeX, rangeY, shift, lined } = pointer;
		// Free sideways (off the desk, out of the screen), held on the desk vertically.
		if (lined)
			shifts[pointer.index] = {
				x: shift.x + dx,
				y: clamp(shift.y + dy, lined.min, lined.max),
			};
		else
			update(pointer.index, {
				x: rangeX > 0 ? from.x + dx / rangeX : from.x,
				y: rangeY > 0 ? clamp(from.y + dy / rangeY) : from.y,
			});

		const last = samples.at(-1) ?? {
			x: event.clientX,
			y: event.clientY,
			time: 0,
		};
		const time = Math.max(1, event.timeStamp - last.time);
		velocity = {
			x: velocity.x * 0.6 + ((event.clientX - last.x) / time) * 0.4,
			y: velocity.y * 0.6 + ((event.clientY - last.y) / time) * 0.4,
		};
		samples.push({ x: event.clientX, y: event.clientY, time: event.timeStamp });
		samples = samples.filter(
			(sample) => event.timeStamp - sample.time <= THROW_WINDOW,
		);
	}

	/** @param {PointerEvent} event */
	function onpointerup(event) {
		if (!pointer || event.pointerId !== pointer.id) return;
		if (dragging !== -1) {
			dragged = true;
			const { inertia } = tuning.desk;
			const speed = releaseSpeed(event.timeStamp);
			if (
				inertia > 0 &&
				Math.hypot(speed.x, speed.y) > THROW_MIN &&
				!prefersReducedMotion.current
			) {
				glides.set(pointer.index, {
					velocity: { x: speed.x * inertia, y: speed.y * inertia },
					rangeX: pointer.rangeX,
					rangeY: pointer.rangeY,
					...(pointer.lined && { lined: pointer.lined }),
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

	/**
	 * Photo: to the pile (in a row: to the front). Video: on top where it lies (in a row: to the
	 * front), playing or paused.
	 * @param {MouseEvent & { currentTarget: HTMLButtonElement }} event
	 * @param {number} i
	 */
	function onclick(event, i) {
		if (dragged) {
			dragged = false;
			return;
		}
		clicked = {
			index: i,
			place: places[i],
			time: event.timeStamp,
			x: event.clientX,
			y: event.clientY,
			handle: event.currentTarget,
		};
		calmUntil = Math.max(calmUntil, event.timeStamp + DOUBLE_CLICK_TIME);
		// Zoomed: a video still plays or pauses, a photo does nothing.
		if (i === zoomed) {
			if (items[i].video) toggle(event.currentTarget);
			return;
		}
		if (active !== null) raised = i;
		else if (items[i].video) {
			glides.delete(i);
			update(i, { z: above(i) });
		} else if (event.detail === 1) {
			// A mouse click may be the first of a double click: the pile move waits a moment.
			glides.delete(i);
			update(i, { z: above(i) });
			pending = {
				index: i,
				timer: setTimeout(() => {
					pending = null;
					pile(i);
				}, PILE_DELAY),
			};
		} else pile(i);
		if (items[i].video) toggle(event.currentTarget);
	}

	/**
	 * The pile move still waiting: dropped (`run` false), or made now.
	 * @param {boolean} run
	 */
	function flushPending(run) {
		if (!pending) return;
		clearTimeout(pending.timer);
		const { index } = pending;
		pending = null;
		if (run) pile(index);
	}

	/**
	 * Every click, before anything else handles it. A single click forgets the photo clicked
	 * before. The second click of a double click begun on a photo zooms that photo (in, or out
	 * when it is zoomed), wherever it lands, even on a neighbour now under the pointer, and
	 * nothing else reacts to it. The first click is undone: a photo comes back from the pile if it
	 * had set off (still on top), so it zooms out to where it lay; a video is played or paused back.
	 * @param {MouseEvent} event
	 */
	function onwindowclickcapture(event) {
		if (event.detail <= 1) {
			clicked = null;
			return;
		}
		if (event.detail !== 2 || !clicked) return;
		event.stopPropagation();
		const { index: i, place, handle } = clicked;
		clicked = null;
		if (pending?.index === i) flushPending(false);
		if (items[i].video) toggle(handle);
		else if (i !== zoomed && active === null)
			update(i, { x: place.x, y: place.y, r: place.r });
		toggleZoom(i);
	}

	/**
	 * @param {KeyboardEvent} event
	 * @param {number} i
	 */
	function onkeydown(event, i) {
		if (event.key === "Escape") return onescape(event);
		if (event.altKey || event.ctrlKey || event.metaKey || i === zoomed) return;
		const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
		const [dx, dy] = {
			ArrowLeft: [-1, 0],
			ArrowRight: [1, 0],
			ArrowUp: [0, -1],
			ArrowDown: [0, 1],
		}[event.key] ?? [0, 0];
		if (!dx && !dy) return;
		event.preventDefault();
		glides.delete(i);
		const lined = rowBounds(i);
		const slot = row.get(i);
		if (lined && slot) {
			// In the row: steps of the free space too, and back on the desk if it was off.
			const shift = shifts[i] ?? { x: 0, y: 0 };
			shifts[i] = {
				x: clamp(
					shift.x + dx * step * (room.width - slot.w),
					-slot.x,
					room.width - slot.w - slot.x,
				),
				y: clamp(
					shift.y + dy * step * (lined.max - lined.min),
					lined.min,
					lined.max,
				),
			};
			raised = i;
			return;
		}
		if (active !== null) return;
		update(i, {
			x: clamp(places[i].x + dx * step),
			y: clamp(places[i].y + dy * step),
			z: above(i),
		});
	}
</script>

<svelte:window
	onclick={onwindowclick}
	onclickcapture={onwindowclickcapture}
	onkeydown={onwindowkeydown}
/>

<div
	class={["desk", focused && "focused", snaps && "snaps"]}
	data-desk
	data-surface={theme}
	bind:this={deskElement}
	style={openTransition()}
	style:--card-margin="calc(var(--margin-base) * {tuning.immersive.cardMargin / 20})"
	style:--card-scale={tuning.immersive.cardScale}
	style:--inner-shadow={tuning.immersive.innerShadow}
	style:--inner-blur={tuning.immersive.innerShadowBlur}
	style:--inner-y={tuning.immersive.innerShadowY}
	style:--parallax={tuning.immersive.parallax}
	style:--desk-bg={desk.background}
	style:--grid-size={desk.spacing}
	style:--grid-line="{desk.lineWidth}px"
	style:--grid-color={gridColor}
>
	<p class="sr-only" id={hint}>{site.labels.deskHint}</p>
	{#if items.some((item) => item.video)}
		<p class="sr-only" id={videoHint}>{site.labels.deskVideoHint}</p>
	{/if}
	<button
		type="button"
		class={["reset", changed && "shown", spinning && "spin"]}
		aria-label={site.labels.deskReset}
		title={site.labels.deskReset}
		onclick={reset}
		onpointerenter={() => (spinning = true)}
	>
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			onanimationend={() => (spinning = false)}
		>
			<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8.27" />
			<path d="M3 3v5.27h5.27" />
		</svg>
	</button>
	{#if groups.length}
		<p class="sr-only" id={groupHint}>{site.labels.deskGroupHint}</p>
		<ul
			class={["groups", arrival === "away" && "away"]}
			aria-label={site.labels.deskGroups}
			style:--labels-delay="{labelsStart + desk.labelsDelay}ms"
			style:--labels-duration="{desk.labelsDuration}ms"
			style:--labels-stagger="{desk.labelsStagger}ms"
			style:--labels-scale={desk.labelsScale}
			bind:this={labelsElement}
		>
			{#each groups as group, k (group)}
				<li style:--k={k}>
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
		class={[
			"surface",
			arrival !== "idle" && arrival,
			zoomed !== -1 && "zooming",
		]}
		aria-label={site.labels.desk}
		style:--size={size}
		style:--top={front}
		style:--arrive-duration="{desk.arriveDuration}ms"
		style:--arrive-scale={desk.arriveScale}
		bind:this={surface}
	>
		{#each items as item, i (keyOf(item))}
			{@const place = places[i]}
			{@const slot = row.get(i)}
			{@const out = active !== null && item.group !== active}
			{@const enlarged = i === zoomed ? zoom : null}
			{@const zoomLabel = enlarged
				? site.labels.deskZoomOut
				: site.labels.deskZoomIn}
			{@const name = item.video ? item.video.label : item.alt}
			<li
				class={[
					"photo",
					dragging === i && "dragging",
					glides.has(i) && "gliding",
					slot && "lined",
					out && "out",
					item.video && "video",
					playing.has(i) && "playing",
					i === zoomed && "zoomed",
					i === current && "current",
				]}
				style:--zoom-x={enlarged && `${enlarged.x}px`}
				style:--zoom-y={enlarged && `${enlarged.y}px`}
				style:--zoom-w={enlarged && `${enlarged.w}px`}
				inert={out}
				style:--x={place.x}
				style:--y={place.y}
				style:--r="{place.r}deg"
				style:--z={slot?.z ?? place.z}
				style:--row-x={slot && `${slot.x}px`}
				style:--row-y={slot && `${slot.y}px`}
				style:--row-w={slot && `${slot.w}px`}
				style:--shift-x={slot && shifts[i] && `${shifts[i].x}px`}
				style:--shift-y={slot && shifts[i] && `${shifts[i].y}px`}
				style:--ratio={ratioOf(item)}
				style:--tilt-x="{tilts[i]?.x ?? 0}deg"
				style:--tilt-y="{tilts[i]?.y ?? 0}deg"
				style:--from={place.x < 0.5 ? -1 : 1}
				style:--delay="{i * desk.arriveStagger}ms"
			>
				<!-- The photo and its zoom button lift and tilt as one: the button stays on the corner. -->
				<div class="lift">
					<button
						type="button"
						class="handle"
						aria-label={item.video &&
							`${playing.has(i) ? site.labels.deskPause : site.labels.deskPlay}: ${item.video.label}`}
						aria-describedby={active !== null
							? groupHint
							: item.video
								? videoHint
								: hint}
						onpointerdown={(event) => onpointerdown(event, i)}
						onpointerenter={(event) => onpointerenter(event, i)}
						{onpointermove}
						{onpointerup}
						{onpointercancel}
						onclick={(event) => onclick(event, i)}
						onkeydown={(event) => onkeydown(event, i)}
						ondragstart={(event) => event.preventDefault()}
					>
						{#if item.video}
							<!-- No controls: the button plays and pauses it (a control inside a button is invalid). -->
							<VideoClip
								video={item.video}
								aria-hidden="true"
								onplay={() => playing.add(i)}
								onpause={() => playing.delete(i)}
								onended={() => playing.delete(i)}
								ontimeupdate={(event) => ontimeupdate(event, i)}
							/>
							<span class="play" aria-hidden="true">
								<svg viewBox="0 0 24 24">
									{#if playing.has(i)}
										<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
									{:else}
										<path d="M8 5.5v13l10.5-6.5z" />
									{/if}
								</svg>
							</span>
							<span
								class={["progress", progress[i] !== undefined && "started"]}
								aria-hidden="true"
								style:--progress={progress[i] ?? 0}
							></span>
						{:else}
							<Picture
								src={item.image}
								alt={item.alt}
								sizes="(max-width: 767px) 82vw, {Math.ceil(
									Math.max(
										size,
										slot && room.width ? (slot.w / room.width) * 100 : 0,
										enlarged && room.width
											? (enlarged.w / room.width) * 100
											: 0,
									),
								)}vw"
								priority={priority && i === 0}
							/>
						{/if}
					</button>
					<!-- Next to the handle, not in it (a button inside a button is invalid). -->
					<button
						type="button"
						class="zoom"
						aria-label={name ? `${zoomLabel}: ${name}` : zoomLabel}
						title={zoomLabel}
						onclick={() => toggleZoom(i)}
						onkeydown={onescape}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<circle cx="10.5" cy="10.5" r="6.5" />
							<path d="M15.5 15.5 20 20M8 10.5h5" />
							{#if !enlarged}
								<path d="M10.5 8v5" />
							{/if}
						</svg>
					</button>
				</div>
			</li>
		{/each}
		{#if zoomed !== -1}
			<!-- Click outside the zoomed photo: back on the desk (keyboard: Escape, or the button). -->
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<li class="scrim" aria-hidden="true" onclick={() => (zoomed = -1)}></li>
		{/if}
	</ul>
</div>

<style>
	/* Full screen, with a grid centred on it (::after). Out of focus: a card, clipped to the side
	   margins and corners of the big image and slightly scaled down; in focus: open to the edges,
	   full size. The clip and scale do not move the layout, so the photos stay put. Photos thrown
	   sideways leave through the edges of the screen without making the page scroll sideways. */
	.desk {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100svh;
		overflow-x: clip;
		padding: var(--margin-base);
		clip-path: inset(0 var(--card-margin) round var(--radius-screen));
		scale: var(--card-scale);
		transition:
			clip-path var(--open-duration) var(--open-ease),
			scale var(--open-duration) var(--open-ease);
	}

	.snaps {
		scroll-snap-align: start;
	}

	/* The grid (one line on the left and top edge of each cell), on its own layer under the photos
	   so it can move with them (parallax, below). Taller than the desk by the parallax range at
	   both ends, so no edge shows; centred, so the grid stays centred on the desk. */
	.desk::after {
		content: "";
		position: absolute;
		inset: calc(var(--parallax) * -100svh) 0;
		z-index: -1;
		background-image: linear-gradient(
				to right,
				var(--grid-color) var(--grid-line),
				transparent 0
			),
			linear-gradient(
				to bottom,
				var(--grid-color) var(--grid-line),
				transparent 0
			);
		background-size: calc(var(--grid-size) * var(--u))
			calc(var(--grid-size) * var(--u));
		background-position: center;
		pointer-events: none;
	}

	/* Slight parallax: the grid and the photos scroll a little slower than the page, behind the
	   edges of the card and its inner shadow, as if seen through a window. Offset = −parallax ×
	   the desk's distance from the top of the screen: none when the desk fills the screen, ± the
	   parallax × screen height as it comes in from the bottom / leaves at the top (it is one
	   screen tall). Driven by the scroll itself (view timeline of the desk, off the main thread);
	   browsers without scroll-driven animations keep the desk still. Setting: `tuning.immersive`. */
	@supports (animation-timeline: view()) {
		/* Inset 0: the default follows the page's scroll padding (room for the fixed header), which
		   would leave an offset when the desk fills the screen. */
		.desk {
			view-timeline: --desk block;
			view-timeline-inset: 0;
		}

		.desk::after,
		.surface {
			animation: desk-parallax linear both;
			animation-timeline: --desk;
			animation-range: cover 0% cover 100%;
		}
	}

	@keyframes desk-parallax {
		from {
			translate: 0 calc(var(--parallax) * -100svh);
		}
		to {
			translate: 0 calc(var(--parallax) * 100svh);
		}
	}

	.focused {
		clip-path: inset(0 round 0);
		scale: 1;
	}

	/* Out of focus the card lies sunk into the page: an inner shadow along its edges, heavier at
	   the top as if lit from above, falling on the photos too (under the labels and the reset
	   button). Opening to full screen, the desk rises flush with the page: the shadow fades out in
	   step with the clip and the scale. It follows the clip (side margins of the card), so its
	   sides stay on the visible edges as they open. Settings: `tuning.immersive` (opacity, blur
	   and offset in Figma px at 1728). */
	.desk::before {
		content: "";
		position: absolute;
		inset: 0 var(--card-margin);
		z-index: 1;
		border-radius: var(--radius-screen);
		box-shadow: inset 0 calc(var(--inner-y) * var(--u))
			calc(var(--inner-blur) * var(--u)) rgb(0 0 0 / var(--inner-shadow));
		pointer-events: none;
		transition:
			inset var(--open-duration) var(--open-ease),
			opacity var(--open-duration) var(--open-ease);
	}

	.focused::before {
		inset: 0;
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.desk,
		.desk::before {
			transition: none;
		}

		.desk::after,
		.surface {
			animation: none;
		}
	}

	[data-surface="white"] {
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
	:global([data-layout="chapter"]) .desk {
		scroll-margin-top: calc(-1 * var(--header-h));
	}

	/* Top right of the desk, above the photos (they stack inside the surface): a grey icon without
	   background, as far from the top as from the right edge of the visible desk. As a card the
	   desk is clipped by the card margin on the sides, so the icon moves in by as much. The icon is
	   the button; a larger invisible area (44 px) catches the pointer.
	   Hidden (out of the tab order too) until the desk has been changed; it fades in then, and out
	   again once the photos are back. Kept while it has the keyboard focus, so pressing it does not
	   drop the focus. */
	.reset {
		--reset-size: calc(var(--mark-size) * 0.6);
		position: absolute;
		top: calc(var(--margin-base) + var(--space-20));
		right: calc(var(--margin-base) + var(--space-20));
		z-index: 1;
		width: var(--reset-size);
		height: var(--reset-size);
		color: var(--muted);
		translate: calc(-1 * var(--card-margin)) 0;
		opacity: 0;
		visibility: hidden;
		transition:
			translate var(--open-duration) var(--open-ease),
			opacity var(--duration-fade) var(--ease-fade),
			visibility 0s linear var(--duration-fade);
	}

	.reset.shown,
	.reset:focus-visible {
		opacity: 1;
		visibility: visible;
		transition:
			translate var(--open-duration) var(--open-ease),
			opacity var(--duration-fade) var(--ease-fade),
			visibility 0s;
	}

	.focused .reset {
		translate: none;
	}

	.reset::before {
		content: "";
		position: absolute;
		inset: calc((44px - var(--reset-size)) / -2);
	}

	.reset svg {
		display: block;
		width: 100%;
		height: 100%;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* One full turn (the way the arrow points) each time the pointer comes over the icon, played
	   to the end even if it leaves. */
	.spin svg {
		animation: reset-spin var(--duration-spin) var(--ease-spin);
	}

	@keyframes reset-spin {
		to {
			rotate: -1turn;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reset {
			transition: none;
		}
	}

	/* Group labels: middle left of the desk, above the photos like the reset button. They look
	   like the chapter chips of the compact header (keep both in step, CompactHeader.svelte):
	   orange chip, ink text, the shown group in white like the current chapter. */
	.groups {
		position: absolute;
		top: 50%;
		left: calc(var(--margin-base) + var(--space-20));
		z-index: 1;
		translate: 0 -50%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 5px;
	}

	/* Entrance: one after the other, growing slightly from their left edge as they fade in. It
	   plays as the page opens (after `labelsDelay`); a desk waiting for its arrival keeps them
	   hidden (.away, no animation), and taking the class off plays it again, timed on the photos
	   (see `labelsStart`). A focused label always shows. */
	.groups li {
		transform-origin: left center;
		animation: desk-label-in var(--labels-duration) var(--ease-arrive)
			calc(var(--labels-delay) + var(--k) * var(--labels-stagger)) both;
	}

	.groups.away li {
		opacity: 0;
		animation: none;
	}

	.groups.away li:has(:focus-visible) {
		opacity: 1;
	}

	@keyframes desk-label-in {
		from {
			opacity: 0;
			scale: var(--labels-scale);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.groups li {
			animation: none;
		}
	}

	.group {
		display: block;
		padding: 3px 12px;
		font-size: var(--type-label);
		line-height: 1;
		letter-spacing: var(--tracking-tight);
		text-align: left;
		color: var(--color-ink);
		background: var(--color-accent);
		border-radius: var(--radius-chip);
		transition: color var(--duration-hover);
	}

	.group:hover,
	.group[aria-pressed="true"] {
		color: var(--color-paper);
	}

	/* Phones: a line at the bottom left, so the row has the whole width. */
	@media (max-width: 767px) {
		.groups {
			top: auto;
			bottom: calc(var(--margin-base) + var(--space-20));
			right: calc(var(--margin-base) + var(--space-20));
			translate: none;
			flex-flow: row wrap;
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
		translate: calc(
				var(--x) * (100cqw - var(--photo-w)) + var(--off, 0) * 100cqw
			)
			calc(var(--y) * (100cqh - var(--photo-w) / var(--ratio)));
		rotate: calc(var(--r) + var(--spin, 0deg));
		scale: var(--drop, 1);
		transition:
			translate var(--duration-slide) var(--ease-slide),
			rotate var(--duration-slide) var(--ease-slide),
			width var(--duration-slide) var(--ease-slide);
	}

	/* Lined-up group: straight, at the place and width of the row (px, see `row`), plus how far
	   it was moved off it (`shifts`). */
	.photo.lined {
		width: var(--row-w);
		translate: calc(var(--row-x) + var(--shift-x, 0px))
			calc(var(--row-y) + var(--shift-y, 0px));
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

	/* Zoomed: straight, centred, as large as fits (px, see `zoom`), above every photo and the
	   veil under it. Meanwhile the surface rises above the labels and the reset button. */
	.photo.zoomed {
		z-index: calc(var(--top) + 3);
		width: var(--zoom-w);
		translate: var(--zoom-x) var(--zoom-y);
		rotate: 0deg;
	}

	.surface.zooming {
		z-index: 2;
	}

	/* Invisible veil under the zoomed photo, over the whole desk (its padding too): a click on it
	   puts the photo back. */
	.scrim {
		position: absolute;
		inset: calc(-1 * var(--margin-base));
		z-index: calc(var(--top) + 2);
	}

	/* The photo and its zoom button, lifted (scale) and tilted (3D, with the speed of the move)
	   as one, so the button stays on the photo's corner. */
	.lift {
		position: relative;
		transform: perspective(1000px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
		transition:
			transform var(--duration-fade) var(--ease-fade),
			scale var(--duration-hover) var(--ease-fade);
	}

	.handle {
		position: relative;
		display: block;
		width: 100%;
		border-radius: var(--radius-screen);
		box-shadow: var(--shadow-photo);
		cursor: grab;
		touch-action: pan-y;
		-webkit-tap-highlight-color: transparent;
		transition: box-shadow var(--duration-hover) var(--ease-fade);
		--picture-radius: var(--radius-screen);
	}

	.handle :global(img),
	.handle :global(video) {
		pointer-events: none;
		-webkit-user-drag: none;
		-webkit-touch-callout: none;
	}

	/* A video lies like a photo: its own ratio, the photo corners, grey until the poster shows. */
	.handle :global(video) {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: var(--ratio);
		border-radius: var(--radius-screen);
		background: var(--color-placeholder);
	}

	/* Round play mark in the middle of the poster. While the video plays it fades out; a pause
	   mark shows in its place under the pointer or with the keyboard focus. */
	.play {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		width: calc(var(--mark-size) * 1.5);
		height: calc(var(--mark-size) * 1.5);
		margin: auto;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.85);
		color: var(--color-ink);
		box-shadow: var(--shadow-photo);
		transition: opacity var(--duration-fade) var(--ease-fade);
	}

	.play svg {
		width: 45%;
		height: 45%;
		fill: currentColor;
	}

	.playing .play {
		opacity: 0;
	}

	.playing .handle:focus-visible .play {
		opacity: 1;
	}

	@media (hover: hover) {
		.playing .handle:hover .play {
			opacity: 1;
		}
	}

	/* How far the video has played: a thin ink line on a light track, inset along the bottom
	   edge (readable on dark and on white screen recordings). Shows once it has started. */
	.progress {
		position: absolute;
		inset: auto 8px 8px;
		height: 3px;
		border-radius: 2px;
		background: rgb(255 255 255 / 0.7);
		opacity: 0;
		transition: opacity var(--duration-fade) var(--ease-fade);
	}

	.progress::after {
		content: "";
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: var(--color-ink);
		transform-origin: left;
		scale: var(--progress) 1;
		transition: scale 250ms linear;
	}

	.progress.started {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.progress::after {
			transition: none;
		}
	}

	/* Under the pointer, on the photo or on its zoom button: slightly lifted. */
	@media (hover: hover) {
		.photo:hover .lift {
			scale: 1.02;
		}

		.photo:hover .handle {
			box-shadow: var(--shadow-photo-lifted);
		}
	}

	/* The tilt follows the move frame by frame; lifted while dragged, back on the desk when thrown.
	   `.photo.…` so these win over the hover above. */
	.photo.dragging .lift,
	.photo.gliding .lift {
		transition: scale var(--duration-hover) var(--ease-fade);
	}

	.photo.dragging .lift {
		scale: 1.05;
	}

	.dragging .handle {
		box-shadow: var(--shadow-photo-lifted);
		cursor: grabbing;
	}

	/* Zoomed: lifted, no growth under the pointer; it does not move, and a click on a photo does
	   nothing (a video still plays and pauses). */
	.photo.zoomed .lift {
		scale: 1;
	}

	.zoomed .handle {
		box-shadow: var(--shadow-photo-lifted);
		cursor: default;
	}

	.zoomed.video .handle {
		cursor: pointer;
	}

	/* Zoom button: a small icon without background at the bottom right of the photo (above the
	   progress line on a video), white in difference mode: black on the light parts of the photo,
	   white on the dark ones. Shown under the pointer, with the keyboard focus, on the zoomed
	   photo, and on touch screens on the photo touched last; hidden while the photo moves. Hidden,
	   it lets clicks through to the photo. A larger invisible area (44 px) catches the pointer. */
	.zoom {
		--zoom-size: calc(var(--mark-size) * 0.6);
		position: absolute;
		right: 8px;
		bottom: 8px;
		display: grid;
		place-items: center;
		width: var(--zoom-size);
		height: var(--zoom-size);
		color: var(--color-paper);
		mix-blend-mode: difference;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity var(--duration-fade) var(--ease-fade),
			scale var(--duration-hover) var(--ease-fade);
	}

	.video .zoom {
		bottom: 19px;
	}

	.zoom::before {
		content: "";
		position: absolute;
		inset: calc((44px - var(--zoom-size)) / -2);
	}

	.zoom svg {
		width: 100%;
		height: 100%;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
	}

	@media (hover: hover) {
		.zoom:hover {
			scale: 1.15;
		}
	}

	.zoom:focus-visible,
	.photo:has(.handle:focus-visible) .zoom,
	.zoomed .zoom {
		opacity: 1;
		pointer-events: auto;
	}

	@media (hover: hover) {
		.photo:hover .zoom {
			opacity: 1;
			pointer-events: auto;
		}
	}

	@media (hover: none) {
		.current .zoom {
			opacity: 1;
			pointer-events: auto;
		}
	}

	.photo.dragging .zoom,
	.photo.gliding .zoom {
		opacity: 0;
		pointer-events: none;
	}


	@media (max-width: 767px) {
		.photo {
			--photo-w: min(min(var(--size) * 1.6, 82) * 1cqw, 86cqh * var(--ratio));
		}
	}
</style>
