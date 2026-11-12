<!--
	@component
	Large image across the content width (1688×997 at 1728, radius 5): Conclusion.
-->
<script>
	/** @import { ImagePath } from '#lib/content/types.js' */
	import Picture from '#lib/components/ui/Picture.svelte';

	/**
	 * @typedef {object} Props
	 * @property {ImagePath} image
	 * @property {string} alt
	 * @property {boolean} [priority]
	 */

	/** @type {Props} */
	let { image, alt, priority = false } = $props();
</script>

<div class="figure">
	<Picture src={image} {alt} ratio={1688 / 997} sizes="calc(100vw - 40px)" {priority} />
</div>

<style>
	.figure {
		padding-inline: var(--margin);
		--picture-radius: var(--radius-screen);
	}
</style>
