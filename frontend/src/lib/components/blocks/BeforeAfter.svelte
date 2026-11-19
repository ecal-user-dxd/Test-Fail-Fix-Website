<!--
	@component
	Before / after carousel (Figma Site/Before-after 579:192, reworked by Martial): looping track of
	16:9 slides with rounded corners, the previous and next slides peeking in at the sides, small
	numbered pager centred below (brief §9).

	Loop without clones: the position is an unbounded integer (page = position mod count) and each
	slide sits on the copy of its slot nearest to the middle of the current move. Slides that change
	copy are off screen when they jump; with 5 pages or more, every move is seamless.

	Interactions: pager; click (left peek → previous, current slide or right peek → next); ← / →
	while focus is inside; swipe or mouse drag (pointer events). No animation with reduced motion.
-->
<script>
	/** @import { ImageRef } from '#lib/content/types.js' */
	import { prefersReducedMotion } from 'svelte/motion';
	import Picture from '#lib/components/ui/Picture.svelte';
	import { site } from '#lib/content/site.js';

	/**
	 * @typedef {object} Props
	 * @property {ImageRef[]} pages
	 * @property {boolean} [priority]
	 */

	/** @type {Props} */
	let { pages, priority = false } = $props();

	/** Px before a pointer move counts as a drag. */
	const DRAG_START = 6;
	/** Share of the slide width a drag must cover to change page… */
	const DRAG_THRESHOLD = 0.15;
	/** …unless it is a flick: px / ms, over at least DRAG_START px. */
	const FLICK_SPEED = 0.4;
	/** Slides this close to the position load eagerly, so the next ones are ready before they show. */
	const PRELOAD = 2;

	const count = $derived(pages.length);

	/** Target position of the track (unbounded). Back to 0 when other pages come in. */
	let position = $derived.by(() => {
		void pages;
		return 0;
	});

	/** Position where the track last came to rest (end of its transition). */
	let rest = $derived.by(() => {
		void pages;
		return 0;
	});

	const index = $derived(mod(position, count));

	/** Slides are placed around the middle of the current move (the position itself at rest). */
	const anchor = $derived((rest + position) / 2);

	/** Horizontal offset of the track while it is dragged, in px. */
	let drag = $state(0);
	let dragging = $state(false);

	/** Polite live region text, set on each move. */
	let announcement = $state('');

	/** Unmoved box of the current slide, to tell the left peek from the rest on click. */
	/** @type {HTMLElement | undefined} */
	let frame = $state();

	/** @type {HTMLButtonElement[]} */
	const buttons = [];

	/** @type {{ id: number, x: number, y: number, time: number } | null} */
	let pointer = null;

	/** A drag just ended: the click that follows it must not change page. */
	let dragged = false;

	/**
	 * @param {number} a
	 * @param {number} b
	 */
	function mod(a, b) {
		return ((a % b) + b) % b;
	}

	/** @param {number} n */
	const pad = (n) => String(n).padStart(2, '0');

	/**
	 * Slot of slide `i`: its copy nearest to the anchor.
	 * @param {number} i
	 */
	const slotOf = (i) => i + count * Math.round((anchor - i) / count);

	/** @param {number} target  unbounded position */
	function go(target) {
		if (count < 2 || target === position) return;
		position = target;
		announcement = `${site.labels.slide} ${index + 1} ${site.labels.of} ${count}`;
		// A 0 ms transition fires no transitionend.
		if (prefersReducedMotion.current) rest = target;
	}

	/**
	 * Page `i`, the shortest way round the loop.
	 * @param {number} i
	 */
	function show(i) {
		let delta = mod(i - index, count);
		if (delta > count / 2) delta -= count;
		go(position + delta);
	}

	/** @param {KeyboardEvent} event */
	function onkeydown(event) {
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
		if (!step || count < 2) return;
		event.preventDefault();
		go(position + step);
		// Focus can only be on a pager button: keep it on the current page.
		buttons[index]?.focus();
	}

	/** @param {MouseEvent} event */
	function onclick(event) {
		if (dragged) {
			dragged = false;
			return;
		}
		if (!frame) return;
		go(position + (event.clientX < frame.getBoundingClientRect().left ? -1 : 1));
	}

	/** @param {PointerEvent} event */
	function onpointerdown(event) {
		dragged = false;
		if (count < 2 || !event.isPrimary || event.button !== 0) return;
		pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp };
	}

	/** @param {PointerEvent & { currentTarget: HTMLElement }} event */
	function onpointermove(event) {
		if (!pointer || event.pointerId !== pointer.id) return;
		const dx = event.clientX - pointer.x;
		if (!dragging) {
			const dy = event.clientY - pointer.y;
			if (Math.abs(dx) < DRAG_START && Math.abs(dy) < DRAG_START) return;
			// Mostly vertical: leave it to the page scroll.
			if (Math.abs(dy) > Math.abs(dx)) {
				pointer = null;
				return;
			}
			dragging = true;
			rest = position;
			event.currentTarget.setPointerCapture(event.pointerId);
		}
		drag = dx;
	}

	/** @param {PointerEvent} event */
	function onpointerup(event) {
		if (!pointer || event.pointerId !== pointer.id) return;
		const start = pointer;
		pointer = null;
		if (!dragging) return;

		const distance = Math.abs(drag);
		const speed = distance / Math.max(1, event.timeStamp - start.time);
		const width = frame?.offsetWidth ?? 0;
		const step = distance > width * DRAG_THRESHOLD || speed > FLICK_SPEED ? -Math.sign(drag) : 0;

		dragging = false;
		drag = 0;
		dragged = true;
		go(position + step);
	}

	/** @param {PointerEvent} event */
	function onpointercancel(event) {
		if (!pointer || event.pointerId !== pointer.id) return;
		pointer = null;
		dragging = false;
		drag = 0;
	}

	/** @param {TransitionEvent} event */
	function ontransitionend(event) {
		if (event.target === event.currentTarget) rest = position;
	}
</script>

<!-- Keys only reach the section from the pager buttons inside it (← / →, brief §9). -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
	class="before-after"
	aria-roledescription="carousel"
	aria-label={site.labels.beforeAfter}
	{onkeydown}
>
	<!-- Click and drag are pointer shortcuts; the pager and ← / → are the keyboard equivalents. -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class={['viewport', dragging && 'dragging', count > 1 && 'interactive']}
		{onclick}
		{onpointerdown}
		{onpointermove}
		{onpointerup}
		{onpointercancel}
		ondragstart={(event) => event.preventDefault()}
	>
		<div class="frame" bind:this={frame}>
			<div class="track" style:--position={position} style:--drag="{drag}px" {ontransitionend}>
				{#each pages as page, i (page.image)}
					{@const slot = slotOf(i)}
					<div
						class="slide"
						role="group"
						aria-roledescription="slide"
						aria-label="{i + 1} {site.labels.of} {count}"
						style:--slot={slot}
						inert={i !== index}
					>
						<Picture
							src={page.image}
							alt={page.alt}
							ratio={16 / 9}
							sizes="(max-width: 864px) calc(100vw - 80px), 91vw"
							loading={Math.abs(slot - position) <= PRELOAD ? 'eager' : 'lazy'}
							priority={priority && i === 0}
						/>
					</div>
				{/each}
			</div>
		</div>
	</div>

	{#if count > 1}
		<ul class="pager">
			{#each pages as page, i (page.image)}
				<li>
					<button
						type="button"
						class="page"
						aria-current={i === index ? 'true' : undefined}
						bind:this={buttons[i]}
						onclick={() => show(i)}
					>
						<span class="sr-only">{site.labels.slide}</span>
						{pad(i + 1)}
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	<p class="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
</section>

<style>
	.before-after {
		/* Visible strip of the previous / next slide, and space between slides. */
		--peek: calc(60 * var(--u));
		--slide-gap: calc(20 * var(--u));
		padding-block: calc(40 * var(--u));
	}

	.viewport {
		overflow: clip;
		padding-inline: calc(var(--peek) + var(--slide-gap));
		touch-action: pan-y;
		user-select: none;
		-webkit-user-select: none;
	}

	.interactive {
		cursor: pointer;
	}

	.dragging {
		cursor: grabbing;
	}

	/* Slides are stacked in one cell and moved by their slot, the track by the position. */
	.track {
		display: grid;
		translate: calc(var(--position) * -1 * (100% + var(--slide-gap)) + var(--drag)) 0;
		transition: translate var(--duration-slide) var(--ease-slide);
	}

	.dragging .track {
		transition: none;
	}

	.slide {
		position: relative;
		grid-area: 1 / 1;
		translate: calc(var(--slot) * (100% + var(--slide-gap))) 0;
		--picture-radius: var(--radius-slide);
		--picture-bg: var(--color-gallery);
	}

	/* Hairline over the image: slides that are white to the edge (Rectify fix-16, fix-17) would
	   otherwise lose their corners and peek against the white page. */
	.slide::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-slide);
		box-shadow: inset 0 0 0 1px var(--color-slide-edge);
		pointer-events: none;
	}

	.pager {
		display: flex;
		justify-content: center;
		gap: calc(4 * var(--u));
		margin-top: calc(14 * var(--u));
	}

	.page {
		display: block;
		padding: calc(6 * var(--u)) calc(10 * var(--u));
		font-size: var(--type-button);
		line-height: var(--leading-button);
		text-transform: uppercase;
		color: var(--color-pager-idle);
		transition:
			color var(--duration-hover),
			background-color var(--duration-hover);
	}

	.page:hover {
		color: var(--color-ink);
	}

	.page[aria-current='true'] {
		color: var(--color-paper);
		background: var(--color-ink);
	}
</style>
