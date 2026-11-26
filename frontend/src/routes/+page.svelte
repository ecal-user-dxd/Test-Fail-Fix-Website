<!--
	Site index « Scan Everything » (not in Figma, brief §14.1). The small « Scan Everything » of the
	compact header is the title, in the same spot and fixed there too; below it, « Index » in big,
	set like the title of a project home (Martial, 26.11.2026). A project's own accent colours its
	link on hover; a click opens the link into the project's opening, and the project name glides
	along (project-name.js).
	Two looks, on trial (Martial, 26.11.2026), chosen by `layout` below:

	- 'columns': the projects two by two, half a screen tall, as the Index / Next project slide at the
	  end of a project (ProjectEnd): the authors small at the top, the name big at the bottom, and the
	  project's isometric drawing in the background, in the middle. On hover a trace runs through it,
	  for as long as the pointer stays: stroke after stroke draws in and disappears again, so the
	  drawing is never seen whole (on a touch screen, while the card is in view; reduced motion: the
	  whole drawing, still). A click carries the trace into the opening, where it completes into the
	  opening's whole drawing;
	- 'rows':    one giant row per project, styled like the « Next chapter » block (the index before).
-->
<script>
	import { afterNavigate, onNavigate } from '$app/navigation';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import { openProject, returnToIndex } from '#lib/components/layout/project-name.js';
	import DisplayLink from '#lib/components/ui/DisplayLink.svelte';
	import { isoPlan } from '#lib/content/iso.js';
	import { projects } from '#lib/content/projects/index.js';
	import { projectHref } from '#lib/content/routes.js';
	import { site } from '#lib/content/site.js';

	/** The look of the index: 'columns' (trial) or 'rows' (before). */
	const layout = /** @type {'columns' | 'rows'} */ ('columns');

	/** No break before the arrow, nor before a dash (« Draw - Scan - Explore »), as DisplayLink. */
	const keep = (/** @type {string} */ title) => title.replaceAll(' - ', ' - ');

	/** Width / height of a drawing, from its viewBox. */
	const ratio = (/** @type {string} */ svg) => {
		const [, w, h] = svg.match(/viewBox="[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/) ?? [];
		return Number(w) / Number(h) || 1;
	};

	/** Every stroke measures 1 (pathLength), so the CSS can hide it until it is drawn. */
	const SHAPES = 'path, line, polyline, polygon, rect, circle, ellipse';
	const measured = (/** @type {string} */ svg) =>
		svg.replace(/<(path|line|polyline|polygon|rect|circle|ellipse)\b/g, '<$1 pathLength="1"');

	/** The trace: each stroke draws in (IN ms), stays (HOLD), then goes (OUT), in the order of the
	    drawing, one every STEP ms. The loop lasts at least twice a stroke's time, so that at most
	    half the drawing shows at once, and at most MAX ms. */
	const STEP = 45;
	const IN = 600;
	const HOLD = 600;
	const OUT = 700;
	const MAX = 7000;
	const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

	/**
	 * The endless animations of one drawing's trace. A stroke is hidden at dash offset 1, whole at 0,
	 * hidden again at -1, gone from its start towards its end.
	 * @param {Element} drawing
	 */
	function trace(drawing) {
		const shapes = [...drawing.querySelectorAll(SHAPES)];
		const cycle = Math.min(MAX, Math.max(2 * (IN + HOLD + OUT), shapes.length * STEP));
		const step = cycle / Math.max(1, shapes.length);
		return shapes.map((shape, i) =>
			shape.animate(
				[
					{ offset: 0, strokeDashoffset: 1, easing: EASE },
					{ offset: IN / cycle, strokeDashoffset: 0 },
					{ offset: (IN + HOLD) / cycle, strokeDashoffset: 0, easing: EASE },
					{ offset: (IN + HOLD + OUT) / cycle, strokeDashoffset: -1 },
					{ offset: 1, strokeDashoffset: -1 }
				],
				{ duration: cycle, delay: i * step, iterations: Infinity, fill: 'backwards' }
			)
		);
	}

	/** @type {HTMLUListElement | undefined} */
	let list = $state();

	$effect(() => {
		if (layout !== 'columns' || !list) return;
		// Reduced motion: the whole drawings, still (CSS).
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		/** @type {Map<Element, { loop: Animation[], fade?: Animation }>} */
		const running = new Map();
		/** Starts the trace, or keeps it if it is still fading out. */
		const start = (/** @type {Element} */ drawing) => {
			const state = running.get(drawing);
			if (!state) return void running.set(drawing, { loop: trace(drawing) });
			state.fade?.cancel();
			state.fade = undefined;
		};
		/** Fades the trace out, then stops it. */
		const stop = (/** @type {Element} */ drawing) => {
			const state = running.get(drawing);
			if (!state || state.fade) return;
			const fade = drawing.animate([{ opacity: 1 }, { opacity: 0 }], {
				duration: 300,
				easing: 'ease-out',
				fill: 'forwards'
			});
			state.fade = fade;
			fade.onfinish = () => {
				state.loop.forEach((animation) => animation.cancel());
				fade.cancel();
				running.delete(drawing);
			};
		};
		const drawings = [...list.querySelectorAll('.drawing')];
		const stopAll = () => {
			for (const [drawing, state] of running) {
				state.loop.forEach((animation) => animation.cancel());
				state.fade?.cancel();
				running.delete(drawing);
			}
		};

		// Mouse: while the card is hovered (or focused).
		if (matchMedia('(hover: hover)').matches) {
			const off = drawings.map((drawing) => {
				const link = drawing.closest('a');
				if (!link) return () => {};
				const on = () => start(drawing);
				const away = () => stop(drawing);
				link.addEventListener('pointerenter', on);
				link.addEventListener('focus', on);
				link.addEventListener('pointerleave', away);
				link.addEventListener('blur', away);
				return () => {
					link.removeEventListener('pointerenter', on);
					link.removeEventListener('focus', on);
					link.removeEventListener('pointerleave', away);
					link.removeEventListener('blur', away);
				};
			});
			return () => {
				off.forEach((remove) => remove());
				stopAll();
			};
		}

		// Touch: while the card is well in view.
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.intersectionRatio >= 0.6) start(entry.target);
					else stop(entry.target);
				}
			},
			{ threshold: [0, 0.6] }
		);
		drawings.forEach((drawing) => observer.observe(drawing));
		return () => {
			observer.disconnect();
			stopAll();
		};
	});

	onNavigate(openProject);
	afterNavigate(returnToIndex);
</script>

<PageMeta title={site.title} />

<div class="page" data-theme="white">
	<header class="layout-grid">
		<h1>{site.shortTitle}</h1>
	</header>

	<main id="main" tabindex="-1">
		<div class="top layout-grid">
			<h2 class="heading">{site.labels.index}</h2>
		</div>

		<ul class={layout} aria-label={site.labels.projects} bind:this={list}>
			{#each projects as project (project.slug)}
				{@const plan = isoPlan(project.slug)}
				<li style:--color-accent={project.accent} data-project={project.slug}>
					{#if layout === 'rows'}
						<DisplayLink href={projectHref(project)} title={project.title} surface="paper" />
					{:else}
						<!-- The name first, for screen readers (« FreshDrop, Choi Seoyun, … »); on screen it
						     sits at the bottom and the authors at the top. -->
						<a href={projectHref(project)}>
							<span class="title">{keep(project.title)}&nbsp;<span aria-hidden="true">→</span></span>
							{#if project.authors.length}
								<span class="label">{project.authors.join(', ')}</span>
							{/if}
							{#if plan}
								<span class="plan" aria-hidden="true">
									<span class="drawing" style:--ratio={ratio(plan)}>{@html measured(plan)}</span>
								</span>
							{/if}
						</a>
					{/if}
				</li>
			{/each}
		</ul>
	</main>
</div>

<style>
	/* Room for the fixed header. */
	.page {
		min-height: 100dvh;
		padding-top: var(--header-h);
		background: var(--page-bg);
	}

	/* Fixed at the top, as the compact header of the project pages (Martial): same height, its 10 px
	   top padding, plus the offset that centres « Scan Everything » on the 33 px project title there,
	   so the title does not move between pages. No background: the index scrolls under it, and
	   clicks go through to the cards. */
	header {
		position: fixed;
		inset: 0 0 auto;
		z-index: 10;
		pointer-events: none;
		align-items: start;
		min-height: var(--header-h);
		padding-top: calc(
			clamp(0.5rem, 0.579vw, 0.925rem) + (var(--type-compact-title) - var(--type-small)) / 2
		);
		view-transition-name: site-header; /* the compact header's, stays put during page transitions */
	}

	h1 {
		font-size: var(--type-small);
		line-height: 1;
		letter-spacing: var(--tracking-tight);
	}

	/* « Index », where and as a project home sets its title (CoverHeader). */
	.top {
		align-items: start;
		padding-block: calc(40 * var(--u)) var(--space-40);
	}

	.heading {
		font-size: var(--type-headline);
		line-height: var(--leading-display);
		letter-spacing: var(--tracking-display);
	}

	ul {
		list-style: none;
		border-bottom: var(--rule);
	}

	main:focus {
		outline: none;
	}

	/* ------------------------------------------------------------------- Columns (trial) */

	/* Two equal columns with a rule between them, each project half a screen tall (taller only if
	   its name needs it), as ProjectEnd. */
	.columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.columns li {
		display: grid;
	}

	.columns a {
		position: relative;
		display: flex;
		flex-direction: column-reverse;
		justify-content: space-between;
		gap: var(--space-40);
		min-width: 0;
		min-height: 50svh;
		container-type: inline-size;
		padding: var(--space-40) var(--margin);
		background: var(--color-paper);
		border-top: var(--rule);
		transition: background-color var(--duration-hover);
		/* As DisplayLink: the font's ascent + descent is taller than the tight display leading. */
		overflow-y: clip;
	}

	.columns li:nth-child(even) a {
		border-left: var(--rule);
	}

	.columns a:hover {
		background: var(--color-accent);
	}

	/* Set like the compact header's project title, as the labels of ProjectEnd. */
	.label {
		max-width: 40ch;
		font-size: var(--type-compact-title);
		line-height: var(--leading-headline);
		letter-spacing: var(--tracking-tight);
	}

	/* The type of ProjectEnd: as big as the index rows, but the widest word and its arrow
	   (« FreshDrop → ») hold on one line of the column, and three lines (« Draw - Scan - Explore → »)
	   in half a screen. */
	.columns .title {
		font-size: min(
			var(--type-display),
			17.5cqi,
			(50svh - 3 * var(--space-40) - var(--type-compact-title)) / 2.6
		);
		line-height: var(--leading-display);
		letter-spacing: var(--tracking-display);
		text-wrap: balance;
		overflow-wrap: break-word;
	}

	/* The name and the authors above the drawing. */
	.columns .title,
	.label {
		position: relative;
		z-index: 1;
	}

	/* The drawing, in the background: in the middle of the card, at most half its width and three
	   quarters of its height, as the opening has it in the middle of the screen. */
	.plan {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		container-type: size;
		pointer-events: none;
	}

	.drawing {
		display: block;
		width: min(50cqw, 76cqh * var(--ratio, 1));
		aspect-ratio: var(--ratio, 1);
	}

	.drawing :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	/* At rest every stroke is hidden (pathLength 1), fills and texts too; the trace shows them in
	   turn. Reduced motion: the whole drawing, still. */
	@media (prefers-reduced-motion: no-preference) {
		.drawing :global(:is(path, line, polyline, polygon, rect, circle, ellipse)) {
			stroke-dasharray: 1 1;
			stroke-dashoffset: 1;
			fill-opacity: 0;
		}

		.drawing :global(text) {
			opacity: 0;
		}
	}

	/* Phone and any upright screen: one project above the other, a third of the screen each (room
	   for the drawing behind the authors and the name). */
	@media (max-width: 767px), (orientation: portrait) {
		.columns {
			grid-template-columns: none;
		}

		.columns a {
			min-height: 33svh;
		}

		.columns li:nth-child(even) a {
			border-left: 0;
		}

		.columns .title {
			font-size: min(var(--type-display), 17.5cqi);
		}
	}
</style>
