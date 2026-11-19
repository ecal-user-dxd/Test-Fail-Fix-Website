<!--
	@component
	Ruled ordered list (Figma Site/List row 555:64).
	- 1 column: number at x 20, text in the right column (Fix ideas).
	- 2 columns: two 864 halves filled top to bottom (01–08 | 09–15), rows aligned across columns.
	The tone squares (black = worked, orange = didn't) are hidden unless `showTone`.
	A list sorted by review type (items with a `tone`) shows as a post-it board grouped by tone
	(see PostItBoard), on every project; `variant: 'rows'` keeps it a ruled list.
-->
<script>
	/** @import { ListItem, ListVariant, Tone } from '#lib/content/types.js' */
	import PostItBoard from './PostItBoard.svelte';

	/**
	 * @typedef {object} Props
	 * @property {1 | 2} columns
	 * @property {ListItem[]} items
	 * @property {Record<Tone, string>} [legend]
	 * @property {boolean} [showTone]
	 * @property {ListVariant} [variant]  default: 'postits' if any item has a tone, else 'rows'
	 */

	/** @type {Props} */
	let { columns, items, legend, showTone = false, variant } = $props();

	const view = $derived(variant ?? (items.some((item) => item.tone) ? 'postits' : 'rows'));
	const rows = $derived(Math.ceil(items.length / columns));
</script>

{#if view === 'postits'}
	<PostItBoard {items} {legend} />
{:else}
	<ol class="list" data-columns={columns} style:--rows={rows}>
		{#each items as item (item.number)}
			<li class={['row', columns === 1 && 'layout-grid']}>
				<span class="head">
					<span class="number">{item.number}</span>
					{#if showTone && item.tone}
						<span class="tone" data-tone={item.tone}>
							{#if legend}<span class="sr-only">{legend[item.tone]}</span>{/if}
						</span>
					{/if}
				</span>
				<span class="text">{item.text}</span>
			</li>
		{/each}
	</ol>
{/if}

<style>
	.row {
		align-items: start;
		padding-block: calc(22 * var(--u)) calc(26 * var(--u));
		border-top: var(--rule);
	}

	.head {
		display: flex;
		align-items: start;
		gap: calc(20 * var(--u));
	}

	.number {
		flex: 0 0 calc(120 * var(--u));
		font-size: var(--type-number);
		line-height: var(--leading-number);
		color: var(--muted);
	}

	.tone {
		flex: none;
		width: calc(18 * var(--u));
		height: calc(18 * var(--u));
	}

	[data-tone='worked'] {
		background: var(--color-ink);
	}

	[data-tone='didnt'] {
		background: var(--color-accent);
	}

	/* Two halves of 864 at 1728, edge to edge; DOM order stays 01 → 15. */
	[data-columns='2'] {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: repeat(var(--rows), auto);
		grid-auto-flow: column;
	}

	[data-columns='2'] .row {
		display: flex;
		padding-inline: var(--margin);
	}

	[data-columns='2'] .head {
		flex: none;
	}

	[data-columns='2'] .text {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 767px) {
		[data-columns='2'] {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: none;
			grid-auto-flow: row;
		}
	}
</style>
