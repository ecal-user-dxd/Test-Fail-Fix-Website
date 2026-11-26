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
	import { beforeNavigate, goto, onNavigate, preloadData } from '$app/navigation';
	import { page } from '$app/state';
	import { chapterHref, projectHref } from '#lib/content/routes.js';

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

	const animated = () =>
		!!document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches;

	/** The running transition, so a walk through pages waits for one slide before the next. */
	/** @type {ViewTransition | undefined} */
	let transition;

	/** True while a click walks through pages: quicker slides (styles/transitions.css). */
	let walking = false;

	// Page transitions (styles/transitions.css): the pages slide past with a band of accent colour,
	// right to left going forward, left to right going back. None with reduced motion, and none
	// on arrival at a project home, where the opening animation (ProjectIntro) covers the change.
	onNavigate((navigation) => {
		if (!animated()) return;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		if (navigation.to?.route.id === '/[project]') return;

		const root = document.documentElement;
		const back = rank(navigation.to?.params) < rank(navigation.from?.params);
		root.dataset.transition = back ? 'back' : 'forward';
		root.toggleAttribute('data-walk', walking);

		return new Promise((resolve) => {
			transition = document.startViewTransition(async () => {
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

	/** Bumped by every click, so a newer click stops a walk under way. */
	let walk = 0;

	// A click that skips pages of the project (Test → Fix, Fix → the home…) goes through the pages
	// in between: one quicker slide per page. Everything is loaded first so nothing waits on the
	// way. The pages in between replace each other in the history, so Back returns to the page of
	// the click.
	beforeNavigate((navigation) => {
		if (navigation.type !== 'link') return;
		const id = ++walk;

		/** @type {Project | undefined} */
		const project = page.data.project;
		const { from, to } = navigation;
		if (!project || !animated()) return;
		if (from?.params?.project !== project.slug || to?.params?.project !== project.slug) return;

		const start = rank(from.params);
		const end = rank(to.params);
		if (Math.abs(end - start) < 2) return;

		const step = Math.sign(end - start);
		const hrefs = [];
		for (let r = start + step; r !== end; r += step) {
			hrefs.push(
				r === 1 ? projectHref(project) : chapterHref(project, project.chapters[r - 2].slug)
			);
		}
		hrefs.push(to.url.href);

		navigation.cancel();
		(async () => {
			await Promise.all(hrefs.map((href) => preloadData(href).catch(() => {})));
			for (const [i, href] of hrefs.entries()) {
				if (id !== walk) return;
				walking = true;
				await goto(href, { replaceState: i > 0 });
				walking = false;
				await transition?.finished.catch(() => {});
			}
		})();
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
