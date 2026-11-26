<!--
	@component
	Image grid of 16:9 cells, 5 px gaps and top/bottom padding, side margins = `--margin` like the
	figure block (Martial). Grey frame on white pages,
	transparent on orange ones. In two columns, an odd last item spans the full width.
	`variant: 'desk'` shows the photos scattered on a desk instead (see GalleryDesk), `variant:
	'viewer'` one at a time in a WebGL viewer with thumbnails and before / after pairs (see
	GalleryViewer); without a `variant`, the block follows `site.galleryVariant`.
	Videos only ever show on a desk (Martial): a gallery with a video item is a desk, whatever its
	`variant`.
-->
<script>
	/** @import { GalleryImage, GalleryItem, GalleryVariant, Theme } from '#lib/content/types.js' */
	import Picture from '#lib/components/ui/Picture.svelte';
	import { site } from '#lib/content/site.js';
	import GalleryDesk from './GalleryDesk.svelte';
	import GalleryViewer from './GalleryViewer.svelte';

	/**
	 * @typedef {object} Props
	 * @property {1 | 2} columns
	 * @property {'cover' | 'contain'} fit
	 * @property {GalleryItem[]} items
	 * @property {Theme} theme
	 * @property {boolean} [priority]
	 * @property {GalleryVariant} [variant]  default: `site.galleryVariant`
	 */

	/** @type {Props} */
	let { columns, fit, items, theme, priority = false, variant = site.galleryVariant } = $props();

	/** @param {number} i */
	const isWide = (i) => columns === 2 && items.length % 2 === 1 && i === items.length - 1;

	/** @type {(item: GalleryItem) => item is GalleryImage} */
	const isImage = (item) => !item.video;

	/** Grid and viewer: only reached without videos, so this is every item. */
	const images = $derived(items.filter(isImage));
</script>

{#if variant === 'desk' || images.length < items.length}
	<GalleryDesk {items} {theme} {priority} />
{:else if variant === 'viewer'}
	<GalleryViewer items={images} {theme} {priority} />
{:else}
	<ul class="gallery" data-surface={theme} style:--columns={columns}>
		{#each images as item, i (item.image)}
			<li class={['cell', isWide(i) && 'wide']}>
				<Picture
					src={item.image}
					alt={item.alt}
					{fit}
					ratio={16 / 9}
					sizes={columns === 1 || isWide(i) ? 'calc(100vw - 40px)' : '(max-width: 767px) calc(100vw - 32px), 50vw'}
					priority={priority && i < columns}
				/>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.gallery {
		display: grid;
		grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
		gap: var(--gutter);
		/* Same side margins as the figure block, so both image edges line up. */
		padding: var(--gutter) var(--margin);
		--picture-radius: var(--radius-screen);
	}

	[data-surface='white'] {
		background: var(--color-gallery);
	}

	.wide {
		grid-column: 1 / -1;
	}

	@media (max-width: 767px) {
		.gallery {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
