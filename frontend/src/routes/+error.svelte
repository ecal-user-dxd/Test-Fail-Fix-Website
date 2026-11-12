<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { site } from '#lib/content/site.js';

	const message = $derived(page.status === 404 ? site.labels.notFound : site.labels.error);
</script>

<svelte:head>
	<title>{page.status}</title>
</svelte:head>

<main id="main" class="error" data-theme="white" tabindex="-1">
	<h1 class="status">{page.status}</h1>
	<p class="message">{message}</p>
	<p class="back"><a href={resolve('/')}>{site.labels.backToStart} ↑</a></p>
</main>

<style>
	.error {
		display: grid;
		align-content: start;
		gap: var(--space-block);
		min-height: 100dvh;
		padding: var(--space-block) var(--margin);
	}

	.status {
		font-size: var(--type-display);
		line-height: var(--leading-display);
		letter-spacing: var(--tracking-display);
	}

	.message {
		font-size: var(--type-headline);
		line-height: var(--leading-headline);
		letter-spacing: var(--tracking-tight);
	}

	.back a {
		font-size: var(--type-label);
		border-bottom: var(--rule);
	}

	main:focus {
		outline: none;
	}
</style>
