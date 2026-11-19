<!--
	@component
	Videos laid out like the gallery grid (5 px gaps and padding, side margins = `--margin`, grey
	frame on white pages, transparent on orange ones), each at its own ratio with the image radius.
	Native controls, nothing plays on its own, nothing loads before play but the poster (Martial).
	A tall video is capped to the viewport height and centred.
-->
<script>
	/** @import { Theme, VideoRef } from '#lib/content/types.js' */
	import { staticHref } from '#lib/content/routes.js';

	/**
	 * @typedef {object} Props
	 * @property {1 | 2} columns
	 * @property {VideoRef[]} items
	 * @property {Theme} theme
	 */

	/** @type {Props} */
	let { columns, items, theme } = $props();

	/** @param {number} i */
	const isWide = (i) => columns === 2 && items.length % 2 === 1 && i === items.length - 1;
</script>

<ul class="videos" data-surface={theme} style:--columns={columns}>
	{#each items as item, i (item.src)}
		<li class={['cell', isWide(i) && 'wide']}>
			<!-- Captions come with `item.captions`, for the videos with speech. -->
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				controls
				playsinline
				preload="none"
				poster={staticHref(item.poster)}
				width={item.width}
				height={item.height}
				aria-label={item.label}
				style:--ratio={item.width / item.height}
			>
				<source src={staticHref(item.src)} type="video/mp4" />
				{#if item.captions}
					<track kind="captions" src={staticHref(item.captions)} srclang="en" label="English" default />
				{/if}
			</video>
		</li>
	{/each}
</ul>

<style>
	.videos {
		display: grid;
		grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
		gap: var(--gutter);
		padding: var(--gutter) var(--margin);
	}

	[data-surface='white'] {
		background: var(--color-gallery);
	}

	.wide {
		grid-column: 1 / -1;
	}

	video {
		display: block;
		/* Full cell width, unless that makes it taller than the viewport (portrait videos). */
		width: min(100%, calc(85svh * var(--ratio)));
		height: auto;
		aspect-ratio: var(--ratio);
		margin-inline: auto;
		border-radius: var(--radius-screen);
		background: var(--color-placeholder);
	}

	@media (max-width: 767px) {
		.videos {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
