<!--
	@component
	Image grid of 16:9 cells, 5 px padding and gaps (Martial). Grey frame on white pages,
	transparent on orange ones. In two columns, an odd last item spans the full width.
-->
<script>
	/** @import { ImageRef, Theme } from '#lib/content/types.js' */
	import Picture from '#lib/components/ui/Picture.svelte';

	/**
	 * @typedef {object} Props
	 * @property {1 | 2} columns
	 * @property {'cover' | 'contain'} fit
	 * @property {ImageRef[]} items
	 * @property {Theme} theme
	 * @property {boolean} [priority]
	 */

	/** @type {Props} */
	let { columns, fit, items, theme, priority = false } = $props();

	/** @param {number} i */
	const isWide = (i) => columns === 2 && items.length % 2 === 1 && i === items.length - 1;
</script>

<ul class="gallery" data-surface={theme} style:--columns={columns}>
	{#each items as item, i (item.image)}
		<li class={['cell', isWide(i) && 'wide']}>
			<Picture
				src={item.image}
				alt={item.alt}
				{fit}
				ratio={16 / 9}
				sizes={columns === 1 || isWide(i) ? '100vw' : '(max-width: 767px) 100vw, 50vw'}
				priority={priority && i < columns}
			/>
		</li>
	{/each}
</ul>

<style>
	.gallery {
		display: grid;
		grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
		gap: var(--gutter);
		padding: var(--gutter);
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
