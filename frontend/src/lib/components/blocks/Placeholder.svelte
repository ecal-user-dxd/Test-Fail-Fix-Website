<!--
	@component
	Phase 1 stand-in for every block type: shows the type, the full texts (never cut) and the
	resolved pictures, to validate content and image pipeline. Removed in phase 2.
-->
<script>
	/** @import { Block } from '#lib/content/types.js' */
	import Picture from '#lib/components/ui/Picture.svelte';

	/** @type {Block & { priority?: boolean }} */
	let props = $props();

	/** Texts and images of the block, in reading order. */
	const content = $derived.by(() => {
		const block = /** @type {Block} */ (props);
		/** @type {string[]} */
		let texts = [];
		/** @type {{ image: string, alt: string }[]} */
		let images = [];

		switch (block.type) {
			case 'headline':
				texts = [block.text];
				break;
			case 'textRow':
				texts = [block.label, block.text].filter(Boolean);
				break;
			case 'numberedRow':
				texts = [`${block.number} ${block.title}`, block.text];
				break;
			case 'stats':
				texts = block.items.map((s) => [s.value, s.label, s.note].filter(Boolean).join(' · '));
				break;
			case 'list':
				texts = block.items.map((item) => `${item.number} ${item.text}`);
				break;
			case 'remarks':
				texts = block.points.map((p) => `${p.number} ${p.text}`);
				images = [{ image: block.image, alt: block.alt }];
				break;
			case 'screens':
			case 'gallery':
				images = block.items;
				break;
			case 'beforeAfter':
				images = block.pages;
				break;
			case 'figure':
				images = [{ image: block.image, alt: block.alt }];
				break;
		}

		return { texts, images };
	});
</script>

<section class="placeholder">
	<p class="type">{props.type}</p>
	{#each content.texts as text, i (i)}
		<p class="text">{text}</p>
	{/each}
	{#if content.images.length}
		<div class="images">
			{#each content.images as item, i (item.image)}
				<Picture src={item.image} alt={item.alt} sizes="25vw" priority={props.priority && i === 0} />
			{/each}
		</div>
	{/if}
</section>

<style>
	.placeholder {
		margin-inline: var(--margin);
		padding: var(--space-20);
		border: 1px dashed currentColor;
	}

	.type {
		font-size: var(--type-number);
		color: var(--muted);
	}

	.text {
		max-width: 60ch;
		margin-top: 0.5em;
		white-space: pre-line;
	}

	.images {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: var(--gutter);
		margin-top: var(--space-20);
	}
</style>
