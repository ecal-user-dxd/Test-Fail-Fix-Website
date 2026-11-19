<!--
	Site index « Scan Everything » (not in Figma, brief §14.1). The small « Scan Everything » of the
	compact header is the title, in the same spot; each project is a giant row styled like the
	« Next chapter » block. A project's own accent colours its row on hover.
-->
<script>
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import DisplayLink from '#lib/components/ui/DisplayLink.svelte';
	import { projects } from '#lib/content/projects/index.js';
	import { projectHref } from '#lib/content/routes.js';
	import { site } from '#lib/content/site.js';
</script>

<PageMeta title={site.title} />

<div class="page" data-theme="white">
	<header class="layout-grid">
		<h1>{site.shortTitle}</h1>
	</header>

	<main id="main" tabindex="-1">
		<ul aria-label={site.labels.projects}>
			{#each projects as project (project.slug)}
				<li style:--color-accent={project.accent}>
					<DisplayLink href={projectHref(project)} title={project.title} surface="paper" />
				</li>
			{/each}
		</ul>
	</main>
</div>

<style>
	.page {
		min-height: 100dvh;
		background: var(--page-bg);
	}

	/* Same height as the compact header. Its 10 px top padding, plus the offset that centres
	   « Scan Everything » on the 33 px project title there, so the title does not move between pages. */
	header {
		align-items: start;
		min-height: var(--header-h);
		padding-top: calc(
			clamp(0.5rem, 0.579vw, 0.925rem) + (var(--type-compact-title) - var(--type-small)) / 2
		);
	}

	h1 {
		font-size: var(--type-small);
		line-height: 1;
		letter-spacing: var(--tracking-tight);
	}

	ul {
		list-style: none;
		border-bottom: var(--rule);
	}

	main:focus {
		outline: none;
	}
</style>
