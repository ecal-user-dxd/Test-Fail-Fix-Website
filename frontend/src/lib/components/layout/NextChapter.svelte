<!--
	@component
	Giant link to the next chapter (Figma Site/Next 567:78). The « Next chapter · 02 » line is hidden
	in every Figma instance: it is kept for screen readers only.
-->
<script>
	/** @import { Next } from '#lib/content/types.js' */
	import DisplayLink from '#lib/components/ui/DisplayLink.svelte';

	/**
	 * @typedef {object} Props
	 * @property {Next} next
	 * @property {string} href
	 * @property {'paper' | 'accent'} surface  default background of the block
	 */

	/** @type {Props} */
	let { next, href, surface } = $props();
</script>

<nav aria-label={next.label}>
	<DisplayLink
		{href}
		title={next.title}
		arrow={next.arrow}
		{surface}
		hint="{next.label}{next.number ? ` ${next.number}` : ''}:"
	/>
</nav>
