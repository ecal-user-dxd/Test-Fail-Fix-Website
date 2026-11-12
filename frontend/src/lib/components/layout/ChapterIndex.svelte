<!--
	@component
	Giant chapter links of the cover pages (Figma Site/Index item 576:71).
-->
<script>
	/** @import { Project } from '#lib/content/types.js' */
	import { chapterNav } from '#lib/content/routes.js';
	import { site } from '#lib/content/site.js';

	/**
	 * @typedef {object} Props
	 * @property {Project} project
	 * @property {string | null} current
	 */

	/** @type {Props} */
	let { project, current } = $props();

	const items = $derived(chapterNav(project, current));
</script>

<nav class="chapter-index" aria-label={site.labels.chapters}>
	<ol>
		{#each items as item (item.slug)}
			<li>
				<a href={item.href} aria-current={item.current ? 'page' : undefined}>
					<span class="sr-only">{item.number}</span>
					{item.label}
				</a>
			</li>
		{/each}
	</ol>
</nav>

<style>
	ol {
		display: flex;
		flex-wrap: wrap;
		column-gap: clamp(1.25rem, 3.472vw, 5.55rem); /* 60 */
		/* Figma keeps an invisible 01–04 line (18 + 6) above each link. */
		padding-top: calc(var(--type-number) * var(--leading-number) + 6px);
	}

	a {
		display: block;
		font-size: var(--type-headline);
		line-height: var(--leading-headline);
		letter-spacing: var(--tracking-tight);
		color: var(--color-ink);
		transition: color var(--duration-hover);
	}

	a:hover,
	a[aria-current='page'] {
		color: var(--color-paper);
	}
</style>
