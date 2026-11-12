<!--
	@component
	Orange cover template: project home and Conclusion (brief §5.3).
-->
<script>
	/** @import { Chapter, Page, PictureMap, Project } from '#lib/content/types.js' */
	import BlockRenderer from '#lib/components/blocks/BlockRenderer.svelte';
	import CoverHeader from '#lib/components/layout/CoverHeader.svelte';
	import NextChapter from '#lib/components/layout/NextChapter.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import { setPictures, setProject } from '#lib/content/context.js';
	import { pageDescription, pageTitle } from '#lib/content/meta.js';
	import { nextHref } from '#lib/content/routes.js';

	/**
	 * @typedef {object} Props
	 * @property {Project} project
	 * @property {Page | Chapter} page
	 * @property {PictureMap} pictures
	 * @property {boolean} [isHome]
	 */

	/** @type {Props} */
	let { project, page, pictures, isHome = false } = $props();

	const chapter = $derived('slug' in page ? page : undefined);

	setProject(() => project);
	setPictures((path) => {
		const picture = pictures[path];
		if (!picture) throw new Error(`Picture "${path}" was not loaded for this page`);
		return picture;
	});
</script>

<PageMeta title={pageTitle(project, chapter)} description={pageDescription(page)} />

<div class="page" data-theme={page.theme} data-layout="cover">
	<CoverHeader {project} current={chapter?.slug ?? null} {isHome} drawing={page.drawing} />

	<main id="main" tabindex="-1" class:home={isHome}>
		<BlockRenderer blocks={page.blocks} theme={page.theme} />
	</main>

	<footer>
		<NextChapter
			next={page.next}
			href={nextHref(project, page.next)}
			surface={isHome ? 'accent' : 'paper'}
		/>
	</footer>
</div>

<style>
	.page {
		min-height: 100dvh;
		background: var(--page-bg);
	}

	main {
		padding-block: var(--space-block);
	}

	/* Home: the introduction is followed by 100 extra before the credits (Figma 551:627). */
	.home {
		--credits-space: calc(var(--space-block) + 100 * var(--u));
	}

	main:focus {
		outline: none;
	}
</style>
