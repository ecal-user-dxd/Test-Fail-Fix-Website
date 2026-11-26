<!--
	@component
	Header of the orange cover pages (home and Conclusion). Since 26.11.2026 (Martial: « compact
	header everywhere ») it is the same fixed compact header as the chapter pages, so the header
	never changes from page to page. Below it, on the home only: the project title as the page's
	h1 in headline size. The big name of the opening animation (ProjectIntro) glides into it
	(`data-intro-title`); back to the index, the title glides into the project's row
	(project-name.js). The isometric plan is drawn by the opening only for now (Martial, 26.11: it
	used to sit in the top-right corner here, see .tmp-review/name/CoverHeader.before-scroll.svelte). A 'center' drawing from the content
	still shows under the title. The Conclusion's 'corner' drawing is not shown any more. The former
	masthead with the giant chapter index is kept in git history (and
	.tmp-review/CoverHeader.before-compact.svelte).
-->
<script>
	/** @import { Drawing, Project } from '#lib/content/types.js' */
	import CompactHeader from './CompactHeader.svelte';
	import Picture from '#lib/components/ui/Picture.svelte';
	import { onNavigate } from '$app/navigation';
	import { leaveHome } from './project-name.js';

	/**
	 * @typedef {object} Props
	 * @property {Project} project
	 * @property {string | null} current
	 * @property {boolean} isHome   the project title is the page's h1 on the home only
	 * @property {Drawing} [drawing]
	 */

	/** @type {Props} */
	let { project, current, isHome, drawing } = $props();

	onNavigate(leaveHome);
</script>

<CompactHeader {project} current={current ?? ''} />

<div class="cover-header">
	{#if isHome}
		<div class="home-top layout-grid">
			<h1 class="title" data-intro-title>{project.title.replaceAll(' - ', '\u00a0- ')}</h1>
		</div>
	{/if}

	{#if drawing?.placement === 'center'}
		<div class="drawing" data-placement={drawing.placement}>
			<Picture src={drawing.image} alt={drawing.alt} sizes="34vw" fit="contain" priority />
		</div>
	{/if}
</div>

<style>
	/* The compact header is fixed: this block starts below it. */
	.cover-header {
		position: relative;
		padding-top: var(--header-h);
		--picture-bg: transparent;
	}

	.home-top {
		align-items: start;
		padding-top: calc(40 * var(--u));
	}

	/* Headline size with the proportions of the index row and of the opening's name (display
	   leading and tracking, balanced lines): they glide into it and become it (project-name.js). */
	.title {
		font-size: var(--type-headline);
		line-height: var(--leading-display);
		letter-spacing: var(--tracking-display);
		text-wrap: balance;
	}

	/* Home: image box 584 wide at x 550. */
	.drawing[data-placement='center'] {
		width: calc(584 / 1728 * 100%);
		margin: calc(11 * var(--u)) 0 calc(60 * var(--u)) calc(550 / 1728 * 100%);
	}
</style>
