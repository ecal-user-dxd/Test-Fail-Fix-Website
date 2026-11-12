<!--
	@component
	Full-bleed band of orange cells with a giant figure (Figma Likert scale 556:105 + Site/Stat 555:65).
	`label` names the band for assistive technologies only.
-->
<script>
	/** @import { StatItem } from '#lib/content/types.js' */

	/**
	 * @typedef {object} Props
	 * @property {string} [label]
	 * @property {StatItem[]} items
	 */

	/** @type {Props} */
	let { label, items } = $props();

	const uid = $props.id();
</script>

<section class="stats" aria-labelledby={label ? `${uid}-title` : undefined}>
	{#if label}
		<h2 class="sr-only" id="{uid}-title">{label}</h2>
	{/if}
	<ul class="cells" style:--count={items.length}>
		{#each items as item, i (i)}
			<li class="cell">
				<p class="value">{item.value}</p>
				<p class="label">{item.label}</p>
				{#if item.note}
					<p class="note">{item.note}</p>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	.cells {
		display: grid;
		grid-template-columns: repeat(var(--count), minmax(0, 1fr));
	}

	.cell {
		padding: calc(20 * var(--u)) calc(20 * var(--u)) calc(28 * var(--u));
		color: var(--color-ink);
		background: var(--color-accent);
		border-left: var(--rule);
	}

	.value {
		margin-bottom: calc(24 * var(--u));
		font-size: var(--type-display);
		line-height: var(--leading-display);
		letter-spacing: var(--tracking-display);
	}

	/* One empty line between label and note, as in Figma. */
	.note {
		margin-top: calc(var(--leading-body) * 1em);
	}

	@media (max-width: 767px) {
		.cells {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.cell {
			border-top: var(--rule);
		}
	}
</style>
