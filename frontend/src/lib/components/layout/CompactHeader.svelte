<!--
	@component
	Fixed header of every project page (Figma Index / Variant3, 550:1427): chapters and, since
	26.11.2026, the orange cover pages too (home, Conclusion; see CoverHeader). Slides up out of the way
	while a full-screen block is in focus (gallery desk, see immersive.svelte.js), and back as soon
	as a link in it gets the keyboard focus.
-->
<script>
	/** @import { Project } from '#lib/content/types.js' */
	import { resolve } from '$app/paths';
	import { chapterNav, projectHref } from '#lib/content/routes.js';
	import { site } from '#lib/content/site.js';
	import { immersive, openTransition } from './immersive.svelte.js';

	/**
	 * @typedef {object} Props
	 * @property {Project} project
	 * @property {string} current  slug of the current chapter
	 */

	/** @type {Props} */
	let { project, current } = $props();

	const items = $derived(chapterNav(project, current));
</script>

<header class={['compact-header', immersive.count > 0 && 'away']} style={openTransition()}>
	<div class="bar layout-grid">
		<p class="brand">
			<a class="site" href={resolve('/')}>{site.shortTitle}</a>
			<a class="project" href={projectHref(project)}>{project.title}</a>
		</p>

		<nav aria-label={site.labels.chapters}>
			<ul class="chips">
				{#each items as item (item.slug)}
					<li>
						<a class="chip" href={item.href} aria-current={item.current ? 'page' : undefined}>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<style>
	/* No background (Martial): the page scrolls under the bar. The empty parts of the bar let
	   clicks through to the content below; only the links catch the pointer. */
	.compact-header {
		position: fixed;
		inset: 0 0 auto;
		z-index: 10;
		height: var(--header-h);
		pointer-events: none;
		view-transition-name: site-header; /* stays put during page transitions */
		transition:
			translate var(--open-duration) var(--open-ease),
			opacity var(--open-duration) var(--open-ease);
	}

	@media (prefers-reduced-motion: reduce) {
		.compact-header {
			transition: none;
		}
	}

	.away {
		translate: 0 -100%;
		opacity: 0;
	}

	.away:focus-within {
		translate: none;
		opacity: 1;
	}

	.compact-header a {
		pointer-events: auto;
	}

	.bar {
		align-items: start;
		padding-top: clamp(0.5rem, 0.579vw, 0.925rem); /* 10 */
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--brand-gap);
		letter-spacing: var(--tracking-tight);
		line-height: 1;
	}

	.site {
		font-size: var(--type-small);
	}

	.project {
		font-size: var(--type-compact-title);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}

	.chip {
		display: block;
		padding: 3px 12px;
		font-size: var(--type-label);
		line-height: 1;
		letter-spacing: var(--tracking-tight);
		color: var(--color-ink);
		background: var(--color-accent);
		border-radius: var(--radius-chip);
		transition: color var(--duration-hover);
	}

	.chip:hover,
	.chip[aria-current='page'] {
		color: var(--color-paper);
	}

	/* Orange cover pages (home, Conclusion): orange chips would vanish on the orange page, so
	   they turn black there, the current one in paper. */
	:global([data-theme='orange']) .chip {
		color: var(--color-accent);
		background: var(--color-ink);
	}

	:global([data-theme='orange']) .chip:hover,
	:global([data-theme='orange']) .chip[aria-current='page'] {
		color: var(--color-paper);
	}
</style>
