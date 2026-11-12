<!--
	@component
	Sentence title of a page, full width (1688 at 1728). The page's only h1.
-->
<script>
	/**
	 * @typedef {object} Props
	 * @property {string} text
	 */

	/** @type {Props} */
	let { text } = $props();
</script>

<h1 class="headline">{text}</h1>

<style>
	.headline {
		padding-inline: var(--margin);
		font-size: var(--type-headline);
		line-height: var(--leading-headline);
		letter-spacing: var(--tracking-tight);
	}
</style>
