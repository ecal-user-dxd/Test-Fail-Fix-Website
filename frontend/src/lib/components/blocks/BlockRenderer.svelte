<!--
	@component
	Renders a page's blocks in order: `block.type` → component. Owns the vertical rhythm between blocks.
-->
<script>
	/** @import { Component } from 'svelte' */
	/** @import { Block, BlockType, Theme } from '#lib/content/types.js' */
	import { dev } from '$app/env';
	import Placeholder from './Placeholder.svelte';

	/**
	 * @typedef {object} Props
	 * @property {Block[]} blocks
	 * @property {Theme} theme
	 */

	/** @type {Props} */
	let { blocks, theme } = $props();

	/**
	 * Phase 1: every type renders a placeholder. Phase 2 replaces each entry with its component.
	 * @type {Record<BlockType, Component<any>>}
	 */
	const registry = {
		headline: Placeholder,
		textRow: Placeholder,
		numberedRow: Placeholder,
		screens: Placeholder,
		remarks: Placeholder,
		stats: Placeholder,
		list: Placeholder,
		beforeAfter: Placeholder,
		gallery: Placeholder,
		figure: Placeholder,
		credits: Placeholder
	};

	/** @type {Set<BlockType>} */
	const MEDIA = new Set(['screens', 'remarks', 'beforeAfter', 'gallery', 'figure']);

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
		<div class="block" data-block={block.type}>
			<BlockComponent {...block} {theme} priority={i === firstMedia} />
		</div>
	{/if}
{/each}

<style>
	.block + .block {
		margin-top: var(--space-block);
	}
</style>
