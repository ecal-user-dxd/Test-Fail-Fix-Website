<!--
	@component
	Safe rendering of plain content text: '\n\n' separates paragraphs (one empty line between them,
	as in Figma), '\n' breaks a line. Never uses {@html}.
-->
<script>
	/**
	 * @typedef {object} Props
	 * @property {string} text
	 * @property {string} [class]
	 */

	/** @type {Props} */
	let { text, class: className } = $props();

	const paragraphs = $derived(text.split('\n\n').map((paragraph) => paragraph.split('\n')));
</script>

<div class={['rich-text', className]}>
	{#each paragraphs as lines, i (i)}
		<p>{#each lines as line, j (j)}{#if j > 0}<br />{/if}{line}{/each}</p>
	{/each}
</div>

<style>
	p + p {
		margin-top: calc(var(--leading-body) * 1em);
	}
</style>
