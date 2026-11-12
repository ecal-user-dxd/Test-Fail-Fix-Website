<!--
	@component
	Album screen with four numbered remarks (Figma Fail/Remarks 583:1023): discs on the screen,
	texts in the side columns (1 and 3 left, 2 and 4 right). Phase 2: default state only —
	every remark closed, side discs at 30 %, texts invisible but taking their space.
-->
<script>
	/** @import { ImagePath, RemarkPoint } from '#lib/content/types.js' */
	import Mark from '#lib/components/ui/Mark.svelte';
	import Picture from '#lib/components/ui/Picture.svelte';
	import RichText from '#lib/components/ui/RichText.svelte';
	import { site } from '#lib/content/site.js';

	/**
	 * @typedef {object} Props
	 * @property {ImagePath} image
	 * @property {string} alt
	 * @property {RemarkPoint[]} points
	 * @property {boolean} [priority]
	 */

	/** @type {Props} */
	let { image, alt, points, priority = false } = $props();

	const uid = $props.id();

	/** Open remarks, by number (phase 3 toggles them). */
	let open = $state(/** @type {Record<string, boolean>} */ ({}));

	const columns = $derived(
		/** @type {const} */ (['left', 'right']).map((side) => ({
			side,
			items: points
				.map((point, index) => ({ point, index }))
				.filter(({ point }) => point.side === side)
		}))
	);
</script>

<section class="remarks" aria-label={site.labels.remarks}>
	{#each columns as column (column.side)}
		<div class="column" data-side={column.side}>
			{#each column.items as { point, index } (point.number)}
				<div class="remark" class:open={open[point.number]}>
					<Mark number={point.number} variant={open[point.number] ? 'ink' : 'accent'} class="side-mark" />
					<div class="text" id="{uid}-{index}">
						<RichText text={point.text} />
					</div>
				</div>
			{/each}
		</div>
	{/each}

	<div class="screen">
		<Picture src={image} {alt} ratio={538 / 958} position="50% 100%" sizes="(max-width: 767px) 80vw, 32vw" {priority} />
		{#each points as point (point.number)}
			<span class="pin" style:left="{point.x}%" style:top="{point.y}%">
				<Mark number={point.number} variant={open[point.number] ? 'ink' : 'accent'} />
			</span>
		{/each}
	</div>
</section>

<style>
	/* 555 | 538 | 555 at 1728, spread over the content width. */
	.remarks {
		display: grid;
		grid-template-columns: calc(555 * var(--u)) calc(538 * var(--u)) calc(555 * var(--u));
		grid-template-areas: 'left screen right';
		justify-content: space-between;
		align-items: start;
		padding: calc(40 * var(--u)) var(--margin);
	}

	.column {
		display: flex;
		flex-direction: column;
		gap: calc(80 * var(--u));
		padding-top: calc(20 * var(--u));
	}

	[data-side='left'] {
		grid-area: left;
	}

	[data-side='right'] {
		grid-area: right;
	}

	.remark {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: calc(14 * var(--u));
	}

	.remark :global(.side-mark) {
		opacity: 0.3;
		transition: opacity var(--duration-fade) var(--ease-fade);
	}

	.remark.open :global(.side-mark) {
		opacity: 1;
	}

	/* Closed: invisible and out of the accessibility tree, but its space is kept. */
	.text {
		visibility: hidden;
		opacity: 0;
		transition:
			opacity var(--duration-fade) var(--ease-fade),
			visibility var(--duration-fade);
	}

	.remark.open .text {
		visibility: visible;
		opacity: 1;
	}

	.screen {
		grid-area: screen;
		position: relative;
		--picture-radius: var(--radius-screen);
	}

	.pin {
		position: absolute;
		display: flex;
		translate: -50% -50%;
	}
</style>
