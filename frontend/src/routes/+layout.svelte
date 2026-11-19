<script>
	import '#lib/styles/reset.css';
	import '#lib/styles/fonts.css';
	import '#lib/styles/tokens.css';
	import '#lib/styles/global.css';
	import favicon from '#lib/assets/favicon.svg';
	import suisseMedium from '#lib/assets/fonts/SuisseIntl-Medium.woff2';
	import SkipLink from '#lib/components/layout/SkipLink.svelte';

	let { children } = $props();

	// Tuning panel (lil-gui), `pnpm dev` only. `import.meta.env.DEV` is replaced at build time,
	// so neither the panel nor lil-gui reaches the static site.
	$effect(() => {
		if (import.meta.env.DEV) {
			let unmount = () => {};
			let gone = false;
			import('#lib/tuning/panel.js').then(({ mountTuningPanel }) => {
				if (!gone) unmount = mountTuningPanel();
			});
			return () => {
				gone = true;
				unmount();
			};
		}
	});
</script>

<svelte:head>
	<link rel="preload" href={suisseMedium} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="icon" href={favicon} />
</svelte:head>

<SkipLink />
{@render children()}
