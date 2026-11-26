<!--
	@component
	Bento of squircle cards (Martial, 20.11.2026): the findings of the Fail pages and the short
	numbered lists. Each card has a small line at the top (title as an h2, or just the number of a list
	item) and a large text at the bottom.
	The sizes come from the number of cards, never from the content: the grid is filled in
	bands that each close their rows, so it has no holes and reads in the content order.
	4 columns, 2 below 1200 px (big and wide cards take the full row), 1 on mobile.
	Squircle corners with `corner-shape`; plain rounded corners where it is not supported.
-->
<script module>
	/** @typedef {'big' | 'wide' | 'small' | 'full'} Shape */

	/**
	 * Card counts of the bands, in order. Each band fills whole rows of the 4-column grid:
	 * 5 = big 2×2 + 4 small, 3 = wide + 2 small, 2 = 2 wide, 1 = full width.
	 * @param {number} count
	 * @returns {number[]}
	 */
	function bands(count) {
		if (count <= 0) return [];
		if (count === 4) return [2, 2];
		if (count === 6) return [3, 3];
		if (count === 7) return [5, 2];
		if (count === 9) return [5, 2, 2];
		if (count <= 5) return [count];
		return [5, 3, ...bands(count - 8)];
	}

	/**
	 * Shape of each card. Every other band is mirrored (big or wide card on the right).
	 * @param {number} count
	 * @returns {Shape[]}
	 */
	function shapes(count) {
		return bands(count).flatMap((size, band) => {
			const mirrored = band % 2 === 1;
			if (size === 5) return mirrored ? ['small', 'small', 'big', 'small', 'small'] : ['big', 'small', 'small', 'small', 'small'];
			if (size === 3) return mirrored ? ['small', 'small', 'wide'] : ['wide', 'small', 'small'];
			if (size === 2) return ['wide', 'wide'];
			return ['full'];
		});
	}
</script>

<script>
	/** @import { BentoItem } from '#lib/content/types.js' */
	import RichText from '#lib/components/ui/RichText.svelte';

	/**
	 * @typedef {object} Props
	 * @property {BentoItem[]} items
	 */

	/** @type {Props} */
	let { items } = $props();

	const layout = $derived(shapes(items.length));
</script>

<ul class="bento">
	{#each items as item, i (i)}
		<li class="card" data-shape={layout[i]}>
			{#if item.title}
				<h2 class="title">
					{#if item.number}<span class="number">{item.number}</span>{/if}
					{item.title}
				</h2>
			{:else if item.number}
				<p class="title">{item.number}</p>
			{/if}
			<RichText text={item.text} class="text" />
		</li>
	{/each}
</ul>

<style>
	.bento {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--gap-card);
		padding-inline: var(--margin);
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: var(--space-40);
		min-height: calc(280 * var(--u));
		padding: var(--space-30);
		background: var(--surface);
		border-radius: calc(var(--radius-squircle) * 0.6);
	}

	/* The same radius reads tighter as a squircle than as a circular arc. */
	@supports (corner-shape: squircle) {
		.card {
			corner-shape: squircle;
			border-radius: var(--radius-squircle);
		}
	}

	/* Small title, large text (Martial). */
	.title {
		font-size: var(--type-number);
		line-height: var(--leading-body);
		text-wrap: balance;
	}

	.number {
		margin-right: 0.5em;
	}

	/* Title at the top, text at the bottom of the card. */
	.card :global(.text) {
		margin-top: auto;
		font-size: var(--type-label);
		line-height: var(--leading-body);
		letter-spacing: var(--tracking-tight);
		text-wrap: pretty;
	}

	.card[data-shape='big'] {
		grid-column: span 2;
		grid-row: span 2;
	}

	.card[data-shape='wide'] {
		grid-column: span 2;
	}

	.card[data-shape='full'] {
		grid-column: 1 / -1;
	}

	@media (max-width: 1199px) {
		.bento {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.card[data-shape='big'],
		.card[data-shape='wide'] {
			grid-column: 1 / -1;
			grid-row: auto;
		}
	}

	@media (max-width: 767px) {
		.bento {
			grid-template-columns: minmax(0, 1fr);
		}

		.card[data-shape] {
			grid-column: auto;
			grid-row: auto;
		}
	}
</style>
