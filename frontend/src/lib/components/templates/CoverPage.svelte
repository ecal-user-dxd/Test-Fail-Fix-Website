<!--
	@component
	Orange cover template: project home and Conclusion (brief §5.3).
-->
<script>
	/** @import { Block, Chapter, Page, PictureMap, Project } from '#lib/content/types.js' */
	import BlockRenderer from '#lib/components/blocks/BlockRenderer.svelte';
	import CoverHeader from '#lib/components/layout/CoverHeader.svelte';
	import NextChapter from '#lib/components/layout/NextChapter.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import ProjectEnd from '#lib/components/layout/ProjectEnd.svelte';
	import ProjectIntro from '#lib/components/layout/ProjectIntro.svelte';
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
	/** The Conclusion ends the project: its last slide leads to the index or the next project. */
	const isLast = $derived(!!chapter && chapter.slug === project.chapters.at(-1)?.slug);

	/**
	 * A page's Vimeo film takes the place of its first figure (Conclusion); with no link yet
	 * (`href: ''`) the figure stays.
	 */
	const blocks = $derived.by(() => {
		const video = page.video;
		if (!video?.href) return page.blocks;
		/** @type {(base?: Block) => Block} */
		const film = (base) => ({ rule: base?.rule, type: 'figure', image: video.poster, alt: '', video });
		const i = page.blocks.findIndex((block) => block.type === 'figure');
		if (i !== -1) return page.blocks.map((block, j) => (j === i ? film(block) : block));
		const at = page.blocks[0]?.type === 'headline' ? 1 : 0;
		return [...page.blocks.slice(0, at), film(), ...page.blocks.slice(at)];
	});

	setProject(() => project);
	setPictures((path) => {
		const picture = pictures[path];
		if (!picture) throw new Error(`Picture "${path}" was not loaded for this page`);
		return picture;
	});
</script>

<PageMeta title={pageTitle(project, chapter)} description={pageDescription(page)} />

<div class="page" data-theme={page.theme} data-layout="cover">
	{#if isHome}
		{#key project.slug}
			<ProjectIntro slug={project.slug} title={project.title} authors={project.authors} />
		{/key}
	{/if}
	<CoverHeader {project} current={chapter?.slug ?? null} {isHome} drawing={page.drawing} />

	<main id="main" tabindex="-1" class:home={isHome}>
		<BlockRenderer {blocks} theme={page.theme} />
	</main>

	<footer>
		{#if isLast}
			<ProjectEnd {project} />
		{:else}
			<NextChapter
				next={page.next}
				href={nextHref(project, page.next)}
				surface={isHome ? 'accent' : 'paper'}
			/>
		{/if}
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
