<!--
	@component
	Orange cover header (Figma Site/Header, Page6 = home, Home = conclusion): a 406 masthead with the
	project title, edition (home only) and chapter index, plus the isometric drawing — large below
	the masthead on the home, small in the top-right corner on the conclusion. Positions are
	measured on the 1:1 captures (the PNG has a 40 px transparent margin).
-->
<script>
	/** @import { Drawing, Project } from '#lib/content/types.js' */
	import ChapterIndex from './ChapterIndex.svelte';
	import Picture from '#lib/components/ui/Picture.svelte';
	import { projectHref } from '#lib/content/routes.js';

	/**
	 * @typedef {object} Props
	 * @property {Project} project
	 * @property {string | null} current
	 * @property {boolean} isHome   the project title is the page's h1 on the home only
	 * @property {Drawing} [drawing]
	 */

	/** @type {Props} */
	let { project, current, isHome, drawing } = $props();
</script>

<header class="cover-header">
	<div class="masthead">
		<div class="top layout-grid">
			{#if isHome}
				<h1 class="title">{project.title}</h1>
				<p class="edition">{project.edition}</p>
			{:else}
				<p class="title"><a href={projectHref(project)}>{project.title}</a></p>
			{/if}
		</div>

		<div class="index">
			<ChapterIndex {project} {current} />
		</div>
	</div>

	{#if drawing}
		<div class="drawing" data-placement={drawing.placement}>
			<Picture
				src={drawing.image}
				alt={drawing.alt}
				sizes={drawing.placement === 'center' ? '34vw' : '14vw'}
				fit="contain"
				priority
			/>
		</div>
	{/if}
</header>

<style>
	.cover-header {
		position: relative;
		--picture-bg: transparent;
	}

	.masthead {
		display: grid;
		grid-template-rows: auto 1fr auto;
		min-height: calc(406 * var(--u));
		padding-block: var(--margin);
	}

	.top {
		align-items: start;
	}

	.title {
		font-size: var(--type-headline);
		line-height: var(--leading-headline);
		letter-spacing: var(--tracking-tight);
	}

	.edition {
		font-size: var(--type-edition);
		line-height: 1;
		letter-spacing: var(--tracking-tight);
	}

	.index {
		grid-row: 3;
		padding-inline: var(--margin);
	}

	/* Home: image box 584×948 at x 550, 11 below the masthead, 60 above the next block. */
	.drawing[data-placement='center'] {
		width: calc(584 / 1728 * 100%);
		margin: calc(11 * var(--u)) 0 calc(60 * var(--u)) calc(550 / 1728 * 100%);
	}

	/* Conclusion: image box 230×374, top 12, right edge at x 1599. */
	.drawing[data-placement='corner'] {
		position: absolute;
		top: calc(12 * var(--u));
		right: calc(129 / 1728 * 100%);
		width: calc(230 / 1728 * 100%);
	}
</style>
