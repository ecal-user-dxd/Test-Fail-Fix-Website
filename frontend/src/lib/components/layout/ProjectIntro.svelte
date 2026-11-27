<!--
	@component
	Opening of a project (Martial, 26.11.2026). Every time a project home opens (page load or
	navigation): an accent curtain with the project name at the bottom left, in the display size of
	the site index rows (DisplayLink), as if the row clicked on the index carried on; the isometric
	plan draws itself in the middle of the screen. Then the page scrolls in (Martial): the curtain and
	its drawing go up and away while the home comes up from below, and the name glides into the home
	title (`[data-intro-title]`). The opening keeps its place above the home (Martial, 26.11): a
	screen of the accent with the drawing in the middle, where the curtain left it, so scrolling back
	up shows the drawing again, as if the scroll-in ran backwards. The page ends the opening scrolled
	down by that screen (or further down, if it was already: back button). The version that docked
	the drawing in the top-right corner of the home is in .tmp-review/name/.

	The name is one element through the site (project-name.js): from the index, the clicked row grows
	into the curtain and its title glides to the bottom left, where this name takes over (it keeps the
	row's arrow, invisible, so its lines break the same way); the drawing starts once the curtain is
	up. View Transitions; without them, the curtain simply lifts with the name and the drawing.

	Source: the project's `iso-plan.svg` (#lib/content/iso.js). Every stroke (path, line, polyline,
	polygon, rect, circle, ellipse) is drawn in, one after the other in document order; text fades
	in. No plan, no opening.

	Once the drawing is done, the authors of the project (`project.authors`, as in the credits)
	appear above the name, and leave with the curtain.

	A click, a key or the wheel skips straight to the scroll. Reduced motion: no opening, and no
	drawing above the home.
	Decorative (aria-hidden): the home title and the credits carry the name and the authors.

	« Scan Everything » stays in its place all along (Martial): the compact header comes over the
	opening with the site name only (`html[data-intro-playing]`, set before the first paint by the
	head script); the project title and the chapters come back with the home.
	Without JS the CSS removes the curtain after a few seconds, so the page is never blocked.
-->
<script>
	import { onMount, tick } from 'svelte';
	import { isoPlan } from '#lib/content/iso.js';
	import { animated, uncover } from './project-name.js';

	/**
	 * @typedef {object} Props
	 * @property {string} slug
	 * @property {string} title
	 * @property {string[]} [authors]
	 */

	/** @type {Props} */
	let { slug, title, authors = [] } = $props();

	/** Drawing time (ms), each stroke's own duration, entrance of the authors at the end of the
	    drawing, hold before the scroll (time to read them), lift of the curtain without View
	    Transitions (quart in-out). */
	const DRAW = 1800;
	const STROKE = 650;
	const CREDIT = 450;
	const HOLD = 1000;
	const GLIDE = 700;

	const svg = $derived(isoPlan(slug));

	/** 'play' while the plan draws, 'move' while the curtain lifts (no View Transitions), 'done'. */
	let phase = $state(/** @type {'play' | 'move' | 'done'} */ ('play'));

	/** @type {HTMLDivElement | undefined} */
	let plan = $state();

	/** @type {HTMLSpanElement | undefined} */
	let credit = $state();

	/** The opening's place above the home, which stays (see above). */
	/** @type {HTMLDivElement | undefined} */
	let above = $state();

	/** Arrived from the index: the row's title is already in place, no entrance of the name. */
	let arrived = $state(false);

	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let timer;

	/** The home title, hidden while the opening plays (the name takes its place). */
	const heading = () => /** @type {HTMLElement | null} */ (document.querySelector('[data-intro-title]'));

	function leave() {
		if (phase !== 'play') return;
		clearTimeout(timer);
		// Skipped mid-drawing: complete the strokes before they move.
		for (const element of [plan, credit]) {
			for (const animation of element?.getAnimations({ subtree: true }) ?? []) animation.finish();
		}
		if (animated()) {
			uncover(async () => {
				done();
				await tick();
				settle();
			});
			return;
		}

		// Without View Transitions the curtain lifts off the home, already in place below it.
		settle();
		phase = 'move';
		timer = setTimeout(done, GLIDE);
	}

	/** The home in view, just below the opening's place, unless the page is further down already. */
	function settle() {
		const height = above?.offsetHeight ?? 0;
		if (scrollY < height) scrollTo({ top: height, behavior: 'instant' });
	}

	function done() {
		if (phase === 'done') return;
		clearTimeout(timer);
		phase = 'done';
		delete document.documentElement.dataset.introPlaying;
		heading()?.style.removeProperty('visibility');
	}

	onMount(() => {
		delete document.documentElement.dataset.introSkip;
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!svg || reduced) {
			delete document.documentElement.dataset.introPlaying;
			phase = 'done';
			return;
		}
		heading()?.style.setProperty('visibility', 'hidden');
		document.documentElement.dataset.introPlaying = '';

		// From the index, the drawing waits for the curtain to be up (project-name.js).
		const root = document.documentElement;
		arrived = root.dataset.projectTransition === 'open';
		const lead = arrived
			? parseFloat(getComputedStyle(root).getPropertyValue('--transition-total')) || 500
			: 0;

		// The drawing of the index (in columns) glides here and draws itself from the click on, from
		// 0 to 100 % (Martial). Otherwise it draws itself once the curtain is up.
		const carried = arrived && root.dataset.projectPlan !== undefined;
		const start = carried ? 0 : lead;
		const drawn = start + DRAW;

		tick().then(() => {
			if (plan) drawStrokes(plan, start);
			credit?.animate(
				[
					{ opacity: 0, translate: '0 0.6em' },
					{ opacity: 1, translate: '0 0' }
				],
				{ duration: CREDIT, delay: drawn, easing: 'cubic-bezier(0.25, 1, 0.5, 1)', fill: 'backwards' }
			);
			timer = setTimeout(leave, drawn + HOLD);
		});

		const skip = () => leave();
		addEventListener('keydown', skip, { once: true });
		addEventListener('wheel', skip, { once: true, passive: true });
		addEventListener('touchmove', skip, { once: true, passive: true });
		return () => {
			clearTimeout(timer);
			removeEventListener('keydown', skip);
			removeEventListener('wheel', skip);
			removeEventListener('touchmove', skip);
			delete document.documentElement.dataset.introPlaying;
			heading()?.style.removeProperty('visibility');
		};
	});

	/**
	 * Draws each stroke in, staggered over DRAW: a dash as long as the stroke slides along it.
	 * @param {HTMLElement} root
	 * @param {number} lead  wait before the first stroke (ms)
	 */
	function drawStrokes(root, lead) {
		const strokes = [
			...root.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse')
		];
		const step = strokes.length > 1 ? (DRAW - STROKE) / (strokes.length - 1) : 0;
		strokes.forEach((el, i) => {
			el.setAttribute('pathLength', '1');
			el.animate(
				[
					{ strokeDasharray: '1 1', strokeDashoffset: 1, fillOpacity: 0 },
					{ strokeDasharray: '1 1', strokeDashoffset: 0, fillOpacity: 0, offset: 0.85 },
					{ strokeDasharray: '1 1', strokeDashoffset: 0, fillOpacity: 1 }
				],
				{ duration: STROKE, delay: lead + i * step, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'backwards' }
			);
		});
		for (const text of root.querySelectorAll('text')) {
			text.animate([{ opacity: 0 }, { opacity: 1 }], {
				duration: 400,
				delay: lead + DRAW * 0.7,
				fill: 'backwards'
			});
		}
	}
</script>

<svelte:head>
	<!-- Before the first paint: reduced motion hides the curtain at once, otherwise the header
	     shows only « Scan Everything » over it (no flash before hydration). -->
	{#if svg}
		{@html `<script>try{var d=document.documentElement.dataset;if(matchMedia('(prefers-reduced-motion: reduce)').matches)d.introSkip='';else d.introPlaying=''}catch(e){}<\/script>`}
	{/if}
</svelte:head>

{#if svg}
	<div class="above" aria-hidden="true" bind:this={above}>
		<div class="plan">{@html svg}</div>
	</div>
{/if}

{#if phase !== 'done' && svg}
	<div class={['intro', phase, arrived && 'arrived']} data-intro aria-hidden="true" onclick={leave}>
		<div class="curtain" data-intro-curtain>
			<div class="plan" data-intro-plan bind:this={plan}>
				{@html svg}
			</div>
			<p class="name">
				{#if authors.length}<span class="authors" bind:this={credit}>{authors.join(', ')}</span>{/if}
				<span class="text" data-intro-name
					>{title.replaceAll(' - ', '\u00a0- ')}&nbsp;<span class="arrow">→</span></span
				>
			</p>
		</div>
	</div>
{/if}

<style>
	.intro {
		position: fixed;
		inset: 0;
		z-index: 100;
		cursor: pointer;
		/* Safety net without JS (or if the timers never run): the curtain goes anyway. */
		animation: intro-away 0s 6s forwards;
	}

	.intro.move {
		pointer-events: none;
	}

	@keyframes intro-away {
		to {
			visibility: hidden;
		}
	}

	/* The drawing is centred on the screen (Martial), the name at the bottom left. Without View
	   Transitions the curtain lifts with both, quart in-out. */
	.curtain {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: var(--color-accent);
		transition: translate 700ms cubic-bezier(0.76, 0, 0.24, 1);
	}

	.move .curtain {
		translate: 0 -100%;
	}

	/* Same size, leading, tracking, padding and line breaks as a row of the site index
	   (DisplayLink): the arrow of the row is there, invisible. */
	.name {
		position: absolute;
		inset: auto 0 0;
		padding: var(--space-40) var(--margin);
		animation: intro-name 600ms cubic-bezier(0.25, 1, 0.5, 1) both;
	}

	.arrived .name {
		animation: none;
	}

	.text {
		display: block;
		font-size: var(--type-display);
		line-height: var(--leading-display);
		letter-spacing: var(--tracking-display);
		text-wrap: balance;
		overflow-wrap: break-word;
	}

	.arrow {
		visibility: hidden;
	}

	/* Above the name, on its left edge, in the size of the project title of the compact header. */
	.authors {
		display: block;
		max-width: 40ch;
		margin-bottom: var(--space-40);
		font-size: var(--type-compact-title);
		line-height: var(--leading-headline);
		letter-spacing: var(--tracking-tight);
		text-wrap: balance;
	}

	@keyframes intro-name {
		from {
			translate: 0 30%;
			opacity: 0;
		}
	}

	/* A screen of the accent at the top of the home, the drawing in its middle as the curtain left
	   it. Under the curtain while the opening plays (the page is at its top then). */
	.above {
		display: grid;
		place-items: center;
		height: 100svh;
		background: var(--color-accent);
	}

	.plan {
		width: min(30vw, 62dvh * 0.62);
		min-width: min(70vw, 280px);
	}

	.plan :global(svg) {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	/* « Scan Everything » over the curtain, in its place: the compact header (CompactHeader) comes
	   above the opening, with the site name only. */
	:global(html:has([data-intro]) .compact-header) {
		z-index: 101;
	}

	:global(html[data-intro-playing] .compact-header .project),
	:global(html[data-intro-playing] .compact-header nav) {
		visibility: hidden;
	}

	:global(html[data-intro-skip]) :is(.intro, .above) {
		display: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.intro,
		.above {
			display: none;
		}
	}
</style>
