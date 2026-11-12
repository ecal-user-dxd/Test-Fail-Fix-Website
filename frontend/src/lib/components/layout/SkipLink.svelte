<script>
	import { site } from '#lib/content/site.js';
</script>

<a class="skip-link" href="#main">{site.labels.skipLink}</a>

<style>
	.skip-link {
		position: fixed;
		top: var(--margin);
		left: var(--margin);
		z-index: 100;
		padding: 0.5em 0.75em;
		font-size: var(--type-small);
		color: var(--color-paper);
		background: var(--color-ink);
		transform: translateY(calc(-100% - 2 * var(--margin)));
	}

	.skip-link:focus-visible {
		transform: none;
		outline-color: var(--color-paper);
	}
</style>
