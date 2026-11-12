<!--
	@component
	Before / after carousel (Figma Site/Before-after 579:192): 16:9 viewport (1688×950 at 1728) on a
	horizontal track, small numbered pager centred below. Phase 2: static, first page shown.
-->
<script>
	/** @import { ImageRef } from '#lib/content/types.js' */
	import Picture from '#lib/components/ui/Picture.svelte';
	import { site } from '#lib/content/site.js';

	/**
	 * @typedef {object} Props
	 * @property {ImageRef[]} pages
	 * @property {boolean} [priority]
	 */

	/** @type {Props} */
	let { pages, priority = false } = $props();

	/** Index of the page shown (phase 3 makes it interactive). */
	let index = $state(0);

	/** @param {number} n */
	const pad = (n) => String(n).padStart(2, '0');
</script>

<section class="before-after" aria-label={site.labels.beforeAfter}>
	<div class="viewport">
		<ul class="track" style:--index={index}>
			{#each pages as page, i (page.image)}
				<li class="slide">
					<Picture
						src={page.image}
						alt={page.alt}
						ratio={1688 / 950}
						sizes="calc(100vw - 40px)"
						priority={priority && i === 0}
					/>
				</li>
			{/each}
		</ul>
	</div>

	<ul class="pager">
		{#each pages as page, i (page.image)}
			<li>
				<button type="button" class="page" aria-current={i === index ? 'true' : undefined}>
					{pad(i + 1)}
				</button>
			</li>
		{/each}
	</ul>
</section>

<style>
	.before-after {
		padding: calc(40 * var(--u)) var(--margin);
	}

	.viewport {
		overflow: hidden;
		background: var(--color-gallery);
		border-radius: var(--radius-screen);
	}

	.track {
		--track-gap: calc(20 * var(--u));
		display: flex;
		gap: var(--track-gap);
		translate: calc(var(--index) * -1 * (100% + var(--track-gap))) 0;
		transition: translate var(--duration-slide) var(--ease-slide);
		--picture-bg: var(--color-gallery);
	}

	.slide {
		flex: 0 0 100%;
	}

	.pager {
		display: flex;
		justify-content: center;
		gap: calc(4 * var(--u));
		margin-top: calc(14 * var(--u));
	}

	.page {
		display: block;
		padding: calc(6 * var(--u)) calc(10 * var(--u));
		font-size: var(--type-button);
		line-height: var(--leading-button);
		text-transform: uppercase;
		color: var(--color-pager-idle);
		transition:
			color var(--duration-hover),
			background-color var(--duration-hover);
	}

	.page:hover {
		color: var(--color-ink);
	}

	.page[aria-current='true'] {
		color: var(--color-paper);
		background: var(--color-ink);
	}
</style>
