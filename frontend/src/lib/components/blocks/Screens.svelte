<!--
	@component
	Centred row of interface screens (538×958 at 1728, radius 5), closed by a full-bleed rule (Test).
-->
<script>
	/** @import { ImageRef } from '#lib/content/types.js' */
	import Picture from '#lib/components/ui/Picture.svelte';

	/**
	 * @typedef {object} Props
	 * @property {ImageRef[]} items
	 * @property {boolean} [priority]  above the fold: every screen loads eagerly
	 */

	/** @type {Props} */
	let { items, priority = false } = $props();
</script>

<ul class="screens">
	{#each items as item (item.image)}
		<li class="screen">
			<Picture
				src={item.image}
				alt={item.alt}
				ratio={538 / 958}
				position="50% 100%"
				sizes="(max-width: 767px) 80vw, 32vw"
				{priority}
			/>
		</li>
	{/each}
</ul>

<style>
	.screens {
		display: flex;
		justify-content: center;
		gap: calc(28 * var(--u));
		padding: 0 var(--margin) calc(40 * var(--u));
		border-bottom: var(--rule);
		--picture-radius: var(--radius-screen);
	}

	.screen {
		flex: 0 1 calc(538 * var(--u));
	}
</style>
