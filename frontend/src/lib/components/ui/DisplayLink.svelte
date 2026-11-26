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
	<span class="title">{title.replaceAll(' - ', '\u00a0- ')}&nbsp;<span aria-hidden="true">{arrow === 'up' ? '↑' : '→'}</span></span>
</a>

<style>
	a {
		display: block;
		padding: var(--space-40) var(--margin);
		background: var(--surface-bg);
		border-top: var(--rule);
		transition: background-color var(--duration-hover);
		/* The font's ascent + descent is taller than the tight display leading: the text boxes
		   spilled past the link and left a strip of page colour under the footer. The glyphs
		   themselves stay well inside the padding. */
		overflow-y: clip;
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
		/* Long titles (« Return Shelf Machine », « Draw - Scan - Explore ») ran past the screen on one
		   line: they wrap now, in balanced lines, the arrow kept on the last word and a dash on the word
		   before it (« Draw - Scan - Explore » never starts a line with « - »). */
		text-wrap: balance;
		overflow-wrap: break-word;
	}
</style>
