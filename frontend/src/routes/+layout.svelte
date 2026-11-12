<script>
	import '#lib/styles/reset.css';
	import '#lib/styles/fonts.css';
	import '#lib/styles/tokens.css';
	import '#lib/styles/global.css';
	import favicon from '#lib/assets/favicon.svg';
	import suisseMedium from '#lib/assets/fonts/SuisseIntl-Medium.woff2';
	import SkipLink from '#lib/components/layout/SkipLink.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="preload" href={suisseMedium} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="icon" href={favicon} />
</svelte:head>

<SkipLink />
{@render children()}
