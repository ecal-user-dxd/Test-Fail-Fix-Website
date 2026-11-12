<!--
	@component
	Single entry point for images: optimised sources (AVIF/WebP srcset), explicit dimensions,
	placeholder background, lazy by default. Fills its frame; the frame ratio defaults to the image's.
-->
<script>
	/** @import { ImagePath } from '#lib/content/types.js' */
	import { getPictures } from '#lib/content/context.js';

	/**
	 * @typedef {object} Props
	 * @property {ImagePath} src
	 * @property {string} alt                 '' for decorative images
	 * @property {string} sizes               rendered width, e.g. '50vw'
	 * @property {'cover' | 'contain'} [fit]
	 * @property {number} [ratio]             frame width / height; defaults to the image ratio
	 * @property {boolean} [priority]         above the fold: eager + fetchpriority high
	 * @property {string} [class]
	 */

	/** @type {Props} */
	let { src, alt, sizes, fit = 'cover', ratio, priority = false, class: className } = $props();

	const lookup = getPictures();
	const picture = $derived(lookup(src));
</script>

<div
	class={['picture', className]}
	style:aspect-ratio={ratio ?? picture.img.w / picture.img.h}
	style:--fit={fit}
>
	<enhanced:img
		class="image"
		src={picture}
		{alt}
		{sizes}
		loading={priority ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding="async"
	/>
</div>

<style>
	.picture {
		position: relative;
		overflow: hidden;
		background: var(--color-placeholder);
	}

	.picture :global(.image) {
		width: 100%;
		height: 100%;
		object-fit: var(--fit);
	}
</style>
