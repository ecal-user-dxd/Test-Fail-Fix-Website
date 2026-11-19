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
	 * @property {string} [position]          CSS object-position of a cropped image
	 * @property {number} [ratio]             frame width / height; defaults to the image ratio
	 * @property {boolean} [priority]         above the fold: eager + fetchpriority high
	 * @property {'lazy' | 'eager'} [loading]  overrides the default (eager if priority, else lazy),
	 *                                         e.g. carousel slides hidden by overflow but shown soon
	 * @property {string} [class]
	 */

	/** @type {Props} */
	let {
		src,
		alt,
		sizes,
		fit = 'cover',
		position = '50% 50%',
		ratio,
		priority = false,
		loading,
		class: className
	} = $props();

	const lookup = getPictures();
	const picture = $derived(lookup(src));
</script>

<div
	class={['picture', className]}
	style:aspect-ratio={ratio ?? picture.img.w / picture.img.h}
	style:--fit={fit}
	style:--position={position}
>
	<enhanced:img
		class="image"
		src={picture}
		{alt}
		{sizes}
		loading={loading ?? (priority ? 'eager' : 'lazy')}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding="async"
	/>
</div>

<style>
	/* Parents can set --picture-bg (e.g. transparent for drawings) and --picture-radius. */
	.picture {
		position: relative;
		overflow: hidden;
		background: var(--picture-bg, var(--color-placeholder));
		border-radius: var(--picture-radius, 0);
	}

	/* enhanced-img wraps the <img> in a <picture>: it must fill the frame too, otherwise the
	   image keeps its own ratio and object-fit / object-position have no effect. */
	.picture :global(picture) {
		display: block;
		width: 100%;
		height: 100%;
	}

	.picture :global(.image) {
		width: 100%;
		height: 100%;
		object-fit: var(--fit);
		object-position: var(--position);
	}
</style>
