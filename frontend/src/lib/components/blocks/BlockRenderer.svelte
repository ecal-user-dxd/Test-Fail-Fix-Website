<!--
	@component
	Renders a page's blocks in order: `block.type` → component. Owns the vertical rhythm between
	blocks (50 at 1728) and the optional full-bleed `rule`.
	Templates can tune the space above the credits with `--credits-space`.
-->
<script>
	/** @import { Component } from 'svelte' */
	/** @import { Block, BlockType, Theme } from '#lib/content/types.js' */
	import { dev } from '$app/env';
	import BeforeAfter from './BeforeAfter.svelte';
	import BeforeAfterReveal from './BeforeAfterReveal.svelte';
	import Credits from './Credits.svelte';
	import Figure from './Figure.svelte';
	import Gallery from './Gallery.svelte';
	import Headline from './Headline.svelte';
	import List from './List.svelte';
	import NumberedRow from './NumberedRow.svelte';
	import Remarks from './Remarks.svelte';
	import Screens from './Screens.svelte';
	import Stats from './Stats.svelte';
	import TextRow from './TextRow.svelte';
	import Video from './Video.svelte';

	/**
	 * @typedef {object} Props
	 * @property {Block[]} blocks
	 * @property {Theme} theme
	 */

	/** @type {Props} */
	let { blocks, theme } = $props();

	/** @type {Record<BlockType, Component<any>>} */
	const registry = {
		headline: Headline,
		textRow: TextRow,
		numberedRow: NumberedRow,
		screens: Screens,
		remarks: Remarks,
		stats: Stats,
		list: List,
		beforeAfter: BeforeAfter,
		beforeAfterReveal: BeforeAfterReveal,
		gallery: Gallery,
		figure: Figure,
		video: Video,
		credits: Credits
	};

	/** @type {Set<BlockType>} */
	const MEDIA = new Set(['screens', 'remarks', 'beforeAfter', 'beforeAfterReveal', 'gallery', 'figure']);

	/** The first media block is above the fold on every page: it loads with high priority. */
	const firstMedia = $derived(blocks.findIndex((block) => MEDIA.has(block.type)));

	$effect(() => {
		if (!dev) return;
		for (const block of blocks) {
			if (!(block.type in registry)) console.warn(`[BlockRenderer] Unknown block type "${block.type}"`, block);
		}
	});
</script>

{#each blocks as block, i (i)}
	{@const BlockComponent = registry[block.type]}
	{#if BlockComponent}
		<div class="block" data-block={block.type} data-rule={block.rule}>
			<BlockComponent {...block} {theme} priority={i === firstMedia} />
		</div>
	{/if}
{/each}

<style>
	.block + .block {
		margin-top: var(--space-block);
	}

	/* Conclusion: headline → figure 22, figure → gallery 5 (the gallery's own padding). */
	[data-block='headline'] + [data-block='figure'] {
		margin-top: calc(22 * var(--u));
	}

	[data-block='figure'] + [data-block='gallery'] {
		margin-top: 0;
	}

	/* Conclusion with a demo video: figure, video and gallery stack 5 apart, like figure → gallery. */
	[data-block='figure'] + [data-block='video'],
	[data-block='figure'] + [data-block='video'] + [data-block='gallery'] {
		margin-top: 0;
	}

	.block + [data-block='credits'] {
		margin-top: var(--credits-space, var(--space-block));
	}

	[data-rule='top'] {
		padding-top: var(--space-30);
		border-top: var(--rule);
	}

	[data-rule='bottom'] {
		padding-bottom: var(--space-30);
		border-bottom: var(--rule);
	}
</style>
