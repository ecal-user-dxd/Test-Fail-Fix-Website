<script>
	/** @import { Project } from '#lib/content/types.js' */
	import '#lib/styles/reset.css';
	import '#lib/styles/fonts.css';
	import '#lib/styles/tokens.css';
	import '#lib/styles/global.css';
	import '#lib/styles/transitions.css';
	import favicon from '#lib/assets/favicon.svg';
	import suisseMedium from '#lib/assets/fonts/SuisseIntl-Medium.woff2';
	import SkipLink from '#lib/components/layout/SkipLink.svelte';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';

	let { children } = $props();

	/**
	 * Place in the reading order: index, project home, then the chapters of the project.
	 * @param {{ project?: string, chapter?: string } | null | undefined} params
	 */
	function rank(params) {
		if (!params?.project) return 0;
		if (!params.chapter) return 1;
		/** @type {Project | undefined} */
		const project = page.data.project;
		return 2 + (project?.chapters.findIndex((chapter) => chapter.slug === params.chapter) ?? 0);
	}

	// Page transitions (styles/transitions.css): the content wipes in with the accent colour,
	// right to left going forward, left to right going back. None with reduced motion, and none
	// on arrival at a project home, where the opening animation (ProjectIntro) covers the change.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		if (navigation.to?.route.id === '/[project]') return;

		const root = document.documentElement;
		const back = rank(navigation.to?.params) < rank(navigation.from?.params);
		root.dataset.transition = back ? 'back' : 'forward';

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
				// Accent of the page that arrives.
				const main = document.getElementById('main');
				if (main) {
					const accent = getComputedStyle(main).getPropertyValue('--color-accent');
					root.style.setProperty('--transition-accent', accent);
				}
			});
		});
	});

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
