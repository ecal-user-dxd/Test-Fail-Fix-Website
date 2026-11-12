<!--
	@component
	Number at x 20, grey title at x 436, body text in the right column (Figma Site/Numbered row 555:44).
	The number and title form the h2, read as « 01 Upcoming shows ».
-->
<script>
	import RichText from '#lib/components/ui/RichText.svelte';

	/**
	 * @typedef {object} Props
	 * @property {string} number
	 * @property {string} title
	 * @property {string} text
	 */

	/** @type {Props} */
	let { number, title, text } = $props();
</script>

<section class="numbered-row layout-grid">
	<h2 class="head">
		<span class="number">{number}</span>
		<span class="title">{title}</span>
	</h2>
	<RichText {text} class="text" />
</section>

<style>
	.numbered-row {
		align-items: start;
	}

	/* Left column split 416 | 425 at 1728: the title starts at x 436. */
	.head {
		display: grid;
		grid-template-columns: 416fr 425fr;
		align-items: start;
		color: var(--muted);
	}

	.number {
		font-size: var(--type-number);
		line-height: var(--leading-number);
	}

	.title {
		font-size: var(--type-label);
		line-height: var(--leading-label);
	}

	@media (max-width: 767px) {
		.head {
			grid-template-columns: auto 1fr;
			column-gap: var(--space-20);
			align-items: baseline;
		}
	}
</style>
