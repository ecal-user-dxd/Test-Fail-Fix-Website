<!--
	@component
	Last slide of a project, at the end of its Conclusion (Martial, 26.11.2026): half a screen tall,
	in two columns. Left, back to the site index; right, the next project by name (in the order of the
	index, the last one leads back to the first). Same giant type and hover as the index rows
	(DisplayLink); the small labels are set like the compact header's project title. Takes the place
	of the « Back to the start » link (the Conclusion's `next`, no longer shown).
-->
<script>
	/** @import { Project } from '#lib/content/types.js' */
	import { resolve } from '$app/paths';
	import { projects } from '#lib/content/projects/index.js';
	import { projectHref } from '#lib/content/routes.js';
	import { site } from '#lib/content/site.js';

	/**
	 * @typedef {object} Props
	 * @property {Project} project  the current project
	 */

	/** @type {Props} */
	let { project } = $props();

	const next = $derived.by(() => {
		const i = projects.findIndex((p) => p.slug === project.slug);
		return projects[(i + 1) % projects.length];
	});

	/** No break before the arrow, nor before a dash (« Draw - Scan - Explore »), as DisplayLink. */
	const keep = (/** @type {string} */ title) => title.replaceAll(' - ', ' - ');
</script>

<nav class="end" aria-label={site.labels.projects}>
	<a class="half" href={resolve('/')}>
		<span class="label">{site.labels.allProjects}</span>
		<span class="title">{site.labels.index}&nbsp;<span aria-hidden="true">↑</span></span>
	</a>
	<a class="half" href={projectHref(next)} style:--color-accent={next.accent}>
		<span class="label">{site.labels.nextProject}</span>
		<span class="title">{keep(next.title)}&nbsp;<span aria-hidden="true">→</span></span>
	</a>
</nav>

<style>
	/* Half a screen (Martial), two equal columns with a rule between them; taller only if a title
	   needs it. */
	.end {
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: 50svh;
		border-top: var(--rule);
	}

	.half {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--space-40);
		min-width: 0;
		container-type: inline-size;
		padding: var(--space-40) var(--margin);
		background: var(--color-paper);
		transition: background-color var(--duration-hover);
		/* As DisplayLink: the font's ascent + descent is taller than the tight display leading. */
		overflow-y: clip;
	}

	.half + .half {
		border-left: var(--rule);
	}

	.half:hover {
		background: var(--color-accent);
	}

	.label {
		font-size: var(--type-compact-title);
		line-height: 1;
		letter-spacing: var(--tracking-tight);
	}

	/* The index rows' type, sized to the column so that the widest word and its arrow
	   (« FreshDrop → », 5.5 em) always hold on one line: the arrow never drops alone. Side by side,
	   also to the half screen, so that three lines (« Draw - Scan - Explore → ») hold in it. */
	.title {
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

	/* Phone and any upright screen: the two halves one above the other, in the same half screen. */
	@media (max-width: 767px), (orientation: portrait) {
		.end {
			grid-template-columns: none;
			grid-template-rows: auto auto;
		}

		.title {
			font-size: min(var(--type-display), 17.5cqi);
		}

		.half + .half {
			border-left: 0;
			border-top: var(--rule);
		}
	}
</style>
