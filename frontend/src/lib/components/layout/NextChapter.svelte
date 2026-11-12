<!--
	@component
	Giant link to the next chapter (Figma Site/Next 567:78). The « Next chapter · 02 » line is hidden
	in every Figma instance: it is kept for screen readers only.
-->
<script>
	/** @import { Next } from '#lib/content/types.js' */

	/**
	 * @typedef {object} Props
	 * @property {Next} next
	 * @property {string} href
	 * @property {'paper' | 'accent'} surface  default background of the block
	 */

	/** @type {Props} */
	let { next, href, surface } = $props();

	const arrow = $derived(next.arrow === 'up' ? '↑' : '→');
</script>

<nav class="next" aria-label={next.label} data-surface={surface}>
	<a {href}>
		<span class="sr-only">{next.label}{next.number ? ` ${next.number}` : ''}:</span>
		<span class="title">{next.title} <span aria-hidden="true">{arrow}</span></span>
	</a>
</nav>

<style>
	.next {
		border-top: var(--rule);
	}

	a {
		display: block;
		padding: var(--space-40) var(--margin);
		background: var(--surface-bg);
		transition: background-color var(--duration-hover);
	}

	[data-surface='paper'] {
		--surface-bg: var(--color-paper);
		--surface-hover: var(--color-accent);
	}

	[data-surface='accent'] {
		--surface-bg: var(--color-accent);
		--surface-hover: var(--color-paper);
	}

	a:hover {
		background: var(--surface-hover);
	}

	.title {
		display: block;
		font-size: var(--type-display);
		line-height: var(--leading-display);
		letter-spacing: var(--tracking-display);
		white-space: nowrap;
	}
</style>
