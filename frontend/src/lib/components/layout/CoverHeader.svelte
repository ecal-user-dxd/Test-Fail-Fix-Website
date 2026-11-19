<!--
	@component
	Orange cover header (Figma Site/Header, Page6 = home, Home = conclusion): a 406 masthead with the
	project title and chapter index, plus the isometric drawing — large below the masthead on the
	home, small in the top-right corner on the conclusion. On the home, the parent page sits left of
	the title as in the compact header: « Scan Everything », 72, project title. Positions are
	measured on the 1:1 captures (the PNG has a 40 px transparent margin).
-->
<script>
	/** @import { Drawing, Project } from '#lib/content/types.js' */
	import { resolve } from "$app/paths";
	import ChapterIndex from "./ChapterIndex.svelte";
	import Picture from "#lib/components/ui/Picture.svelte";
	import { projectHref } from "#lib/content/routes.js";
	import { site } from "#lib/content/site.js";

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
		<div class="top">
			{#if isHome}
				<a class="site" href={resolve("/")}>{site.shortTitle}</a>
				<h1 class="title">{project.title}</h1>
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
				sizes={drawing.placement === "center" ? "34vw" : "14vw"}
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

	/* Parent and title read as one line: small label on the title's baseline. */
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		column-gap: var(--brand-gap);
		padding-inline: var(--margin);
		letter-spacing: var(--tracking-tight);
	}

	.site {
		font-size: var(--type-small);
		line-height: 1;
	}

	.title {
		font-size: var(--type-headline);
		line-height: var(--leading-headline);
	}

	.index {
		grid-row: 3;
		padding-inline: var(--margin);
		border-top: 1px solid black;
		border-bottom: 1px solid black;
	}

	/* Home: image box 584×948 at x 550, 11 below the masthead, 60 above the next block. */
	.drawing[data-placement="center"] {
		width: calc(584 / 1728 * 100%);
		margin: calc(11 * var(--u)) 0 calc(60 * var(--u)) calc(550 / 1728 * 100%);
	}

	/* Conclusion: image box 230×374, top 12, right edge at x 1599. */
	.drawing[data-placement="corner"] {
		position: absolute;
		top: calc(12 * var(--u));
		right: calc(129 / 1728 * 100%);
		width: calc(230 / 1728 * 100%);
	}
</style>
