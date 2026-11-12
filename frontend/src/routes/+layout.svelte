<script>
	import '#lib/styles/reset.css';
	import '#lib/styles/tokens.css';
	import '#lib/styles/global.css';
	import favicon from '#lib/assets/favicon.svg';
	import SkipLink from '#lib/components/layout/SkipLink.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SkipLink />
{@render children()}
