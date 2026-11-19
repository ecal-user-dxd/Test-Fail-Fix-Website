<!--
	@component
	Full-width link in the display size with a top rule (Figma Site/Next 567:78). Used by the
	« Next chapter » block and by the rows of the site index.
-->
<script>
	/**
	 * @typedef {object} Props
	 * @property {string} href
	 * @property {string} title
	 * @property {'right' | 'up'} [arrow]       defaults to 'right'
	 * @property {'paper' | 'accent'} surface   default background; the hover shows the other one
	 * @property {string} [hint]                read before the title, by screen readers only
	 */

	/** @type {Props} */
	let { href, title, arrow = 'right', surface, hint } = $props();
</script>

<a {href} data-surface={surface}>
	{#if hint}<span class="sr-only">{hint}</span>{/if}
	<span class="title">{title} <span aria-hidden="true">{arrow === 'up' ? '↑' : '→'}</span></span>
</a>

<style>
	a {
		display: block;
		padding: var(--space-40) var(--margin);
		background: var(--surface-bg);
		border-top: var(--rule);
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
