<!--
	@component
	Orange cover header (Figma Site/Header, Page6 = home, Home = conclusion): project title,
	edition (home only), chapter index and isometric drawing.
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

	{#if drawing}
		<div class="drawing" data-placement={drawing.placement}>
			<Picture
				src={drawing.image}
				alt={drawing.alt}
				sizes={drawing.placement === 'center' ? '31vw' : '12vw'}
				fit="contain"
				priority
			/>
		</div>
	{/if}
</header>

<style>
	.cover-header {
		position: relative;
		display: grid;
		grid-template-rows: auto 1fr auto;
		min-height: clamp(14rem, 23.495vw, 37.6rem); /* 406 */
		padding-block: var(--space-20);
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

	.drawing[data-placement='center'] {
		width: 31.25%; /* 540 / 1728 */
		margin: var(--space-40) auto 0;
	}

	.drawing[data-placement='corner'] {
		position: absolute;
		top: var(--space-20);
		right: 13.4%; /* centred on x ≈ 1490 at 1728 */
		width: 12.4%; /* 215 / 1728 */
	}
</style>
