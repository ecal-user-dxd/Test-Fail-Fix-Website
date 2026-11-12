<!--
	@component
	Grey label on the left (300 wide), body text in the right column (Figma Site/Text row 555:41).
	With a label it is a section titled by an h2; without, a plain group.
-->
<script>
	import RichText from '#lib/components/ui/RichText.svelte';

	/**
	 * @typedef {object} Props
	 * @property {string} label  may be ''
	 * @property {string} text
	 */

	/** @type {Props} */
	let { label, text } = $props();
</script>

<svelte:element this={label ? 'section' : 'div'} class="text-row layout-grid">
	{#if label}
		<h2 class="label">{label}</h2>
	{/if}
	<RichText {text} class="text" />
</svelte:element>

<style>
	.text-row {
		align-items: start;
	}

	.label {
		grid-column: 1;
		max-width: calc(300 * var(--u));
		font-size: var(--type-label);
		line-height: var(--leading-label);
		color: var(--muted);
	}

	.text-row :global(.text) {
		grid-column: 2;
	}

	@media (max-width: 767px) {
		.text-row :global(.text) {
			grid-column: 1;
		}
	}
</style>
