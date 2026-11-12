<!--
	@component
	White chapter template: Test, Fail, Fix, with the fixed compact header (brief §5.3).
-->
<script>
	/** @import { Chapter, PictureMap, Project } from '#lib/content/types.js' */
	import BlockRenderer from '#lib/components/blocks/BlockRenderer.svelte';
	import CompactHeader from '#lib/components/layout/CompactHeader.svelte';
	import NextChapter from '#lib/components/layout/NextChapter.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import { setPictures, setProject } from '#lib/content/context.js';
	import { pageDescription, pageTitle } from '#lib/content/meta.js';
	import { nextHref } from '#lib/content/routes.js';

	/**
	 * @typedef {object} Props
	 * @property {Project} project
	 * @property {Chapter} chapter
	 * @property {PictureMap} pictures
	 */

	/** @type {Props} */
	let { project, chapter, pictures } = $props();

	setProject(() => project);
	setPictures((path) => {
		const picture = pictures[path];
		if (!picture) throw new Error(`Picture "${path}" was not loaded for this page`);
		return picture;
	});
</script>

<PageMeta title={pageTitle(project, chapter)} description={pageDescription(chapter)} />

<div class="page" data-theme={chapter.theme} data-layout="chapter">
	<CompactHeader {project} current={chapter.slug} />

	<main id="main" tabindex="-1">
		<BlockRenderer blocks={chapter.blocks} theme={chapter.theme} />
	</main>

	<footer>
		<NextChapter next={chapter.next} href={nextHref(project, chapter.next)} surface="paper" />
	</footer>
</div>

<style>
	.page {
		min-height: 100dvh;
		background: var(--page-bg);
	}

	main {
		padding-top: var(--header-h);
		padding-bottom: var(--space-block);
	}

	main:focus {
		outline: none;
	}
</style>
