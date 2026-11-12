<!--
	@component
	Fixed header of the chapter pages (Figma Index / Variant3, 550:1427).
-->
<script>
	/** @import { Project } from '#lib/content/types.js' */
	import { resolve } from '$app/paths';
	import { chapterNav, projectHref } from '#lib/content/routes.js';
	import { site } from '#lib/content/site.js';

	/**
	 * @typedef {object} Props
	 * @property {Project} project
	 * @property {string} current  slug of the current chapter
	 */

	/** @type {Props} */
	let { project, current } = $props();

	const items = $derived(chapterNav(project, current));
</script>

<header class="compact-header">
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
	.compact-header {
		position: fixed;
		inset: 0 0 auto;
		z-index: 10;
		height: var(--header-h);
		background: var(--color-paper);
	}

	.bar {
		align-items: start;
		padding-top: clamp(0.5rem, 0.579vw, 0.925rem); /* 10 */
	}

	.brand {
		display: flex;
		align-items: center;
		gap: clamp(1rem, 4.167vw, 6.66rem); /* 72 */
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
</style>
