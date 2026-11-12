<!--
	@component
	Numbered disc (Figma Site/Mark 555:72): orange = a remark, black = a change. Purely visual:
	the interactive parent (a button) carries the accessible name.
-->
<script>
	/**
	 * @typedef {object} Props
	 * @property {string} number
	 * @property {'accent' | 'ink'} [variant]
	 * @property {string} [class]
	 */

	/** @type {Props} */
	let { number, variant = 'accent', class: className } = $props();
</script>

<span class={['mark', className]} data-variant={variant}>{number}</span>

<style>
	.mark {
		display: inline-grid;
		place-items: center;
		width: var(--mark-size);
		height: var(--mark-size);
		border-radius: 50%;
		font-size: var(--type-number);
		line-height: var(--leading-number);
		transition:
			background-color var(--duration-fade) var(--ease-fade),
			color var(--duration-fade) var(--ease-fade);
	}

	[data-variant='accent'] {
		color: var(--color-ink);
		background: var(--color-accent);
	}

	[data-variant='ink'] {
		color: var(--color-paper);
		background: var(--color-ink);
	}
</style>
