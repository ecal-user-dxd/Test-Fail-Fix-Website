/**
 * One project name through the site (Martial, 26.11.2026): the title of a row of the index, the big
 * name of the opening (ProjectIntro) and the title of the project home are one element, which moves
 * from one place to the next with the View Transitions API (styles/project-name.css).
 *
 * - Index → project: the row opens into the opening's curtain, its title glides down to the
 *   bottom left and its drawing (index in columns) to the middle of the screen, drawing itself
 *   whole on the way
 *   (`openProject`, onNavigate of the index; the page transitions of routes/+layout.svelte leave
 *   this arrival alone).
 * - Opening → home: the page scrolls in, the curtain and its drawing go up and away while the
 *   home comes up from below, and the name glides into the home title (`uncover`, called by
 *   ProjectIntro).
 * - Home → index: during the page transition back, the home title glides into its row
 *   (`leaveHome`, onNavigate of CoverHeader, then `returnToIndex`, afterNavigate of the index).
 *
 * The names (project-name, project-curtain, project-plan) are given inline, only for the
 * transition that needs them, and taken off when it ends, so the page transitions never see them.
 * While one of these transitions runs, `html[data-project-transition]` says which, and
 * `html[data-project-plan]` that the index's drawing travels too.
 */
/** @import { OnNavigate } from '$app/navigation' */
import '#lib/styles/project-name.css';
import { isoPlan } from '#lib/content/iso.js';

/** @typedef {'open' | 'uncover' | 'close'} Kind */

/**
 * @typedef {object} Names
 * @property {(element: Element | null | undefined, name: string) => void} tag
 * @property {() => void} clear
 */

export const animated = () =>
	!!document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The transition under way: a new one takes its names off first. */
/** @type {Names | undefined} */
let current;

/**
 * Starts a transition of the name: the names of the previous one are taken off.
 * @param {Kind} kind
 * @returns {Names}
 */
function begin(kind) {
	current?.clear();
	/** @type {HTMLElement[]} */
	const tagged = [];
	/** @type {Names} */
	const names = {
		tag(element, name) {
			if (!(element instanceof HTMLElement)) return;
			element.style.viewTransitionName = name;
			tagged.push(element);
		},
		clear() {
			for (const element of tagged) element.style.removeProperty('view-transition-name');
			tagged.length = 0;
		}
	};
	current = names;
	document.documentElement.dataset.projectTransition = kind;
	delete document.documentElement.dataset.projectPlan;
	return names;
}

/** @param {Names} names */
function end(names) {
	if (current !== names) return;
	names.clear();
	current = undefined;
	delete document.documentElement.dataset.projectTransition;
	delete document.documentElement.dataset.projectPlan;
}

/**
 * Ends with the transition, whether it runs to the end or is skipped.
 * @param {ViewTransition | null | undefined} transition
 * @param {Names} names
 */
function endWith(transition, names) {
	const done = () => end(names);
	if (transition) transition.finished.then(done, done);
	else setTimeout(done, 1000);
}

/**
 * The name keeps its proportions as it changes size: both pictures of it scale by the ratio of the
 * two font sizes (--project-name-scale), not by the ratio of the two boxes.
 * @param {Element | null | undefined} from
 * @param {Element | null | undefined} to
 */
function scale(from, to) {
	if (!from || !to) return;
	const ratio = parseFloat(getComputedStyle(to).fontSize) / parseFloat(getComputedStyle(from).fontSize);
	document.documentElement.style.setProperty('--project-name-scale', String(ratio || 1));
}

/** The opening's elements and the home title (ProjectIntro, CoverHeader). */
const find = {
	curtain: () => document.querySelector('[data-intro-curtain]'),
	name: () => document.querySelector('[data-intro-name]'),
	plan: () => document.querySelector('[data-intro-plan]'),
	title: () => document.querySelector('[data-intro-title]')
};

/**
 * onNavigate of the index: the clicked row opens into the curtain of the opening and its title
 * glides to the bottom left, where the opening shows the name. « Scan Everything » (site-header)
 * stays above it all (styles/project-name.css).
 * @param {OnNavigate} navigation
 */
export function openProject(navigation) {
	const slug = navigation.to?.params?.project;
	// No plan, no opening: the project home simply appears, as before.
	if (!animated() || !slug || navigation.to?.route.id !== '/[project]' || !isoPlan(slug)) return;
	const row = document.querySelector(`[data-project="${CSS.escape(slug)}"]`);
	const link = row?.querySelector('a');
	const title = row?.querySelector('.title');
	if (!link || !title) return;
	// The drawing of the index in columns glides into the middle of the opening. Its trace (hover,
	// focus, in view on a touch screen) stops at the click: the drawing leaves empty and draws itself
	// whole on the way, from 0 to 100 % (Martial; ProjectIntro). No drawing (index in rows): the
	// opening draws its own once the curtain is up.
	const drawing = row?.querySelector('.drawing');
	for (const animation of drawing?.getAnimations({ subtree: true }) ?? []) animation.cancel();

	const names = begin('open');
	names.tag(link, 'project-curtain');
	names.tag(title, 'project-name');
	names.tag(drawing, 'project-plan');
	// Tells the opening to draw its drawing from the click on (ProjectIntro).
	if (drawing) document.documentElement.dataset.projectPlan = '';

	return new Promise((resolve) => {
		const transition = document.startViewTransition(async () => {
			resolve(undefined);
			await navigation.complete;
			names.tag(find.curtain(), 'project-curtain');
			names.tag(find.name(), 'project-name');
			if (drawing) names.tag(find.plan(), 'project-plan');
			scale(title, find.name());
		});
		endWith(transition, names);
	});
}

/**
 * End of the opening: the page scrolls in under the curtain and the name glides into the home
 * title. `update` removes the opening and shows the title.
 * @param {() => Promise<void>} update
 * @returns {ViewTransition}
 */
export function uncover(update) {
	const names = begin('uncover');
	const name = find.name();
	names.tag(find.curtain(), 'project-curtain');
	names.tag(name, 'project-name');
	scale(name, find.title());

	const transition = document.startViewTransition(async () => {
		await update();
		names.tag(find.title(), 'project-name');
	});
	endWith(transition, names);
	return transition;
}

/** The row the home title goes back to, and its names. */
/** @type {{ slug: string, size: number, names: Names } | undefined} */
let returning;

/**
 * onNavigate of the project home: on the way back to the index, its title becomes the name that
 * glides into the project's row, inside the page transition of routes/+layout.svelte.
 * @param {OnNavigate} navigation
 */
export function leaveHome(navigation) {
	const slug = navigation.from?.params?.project;
	const title = find.title();
	if (!animated() || !slug || !title || navigation.to?.route.id !== '/') return;
	const names = begin('close');
	names.tag(title, 'project-name');
	returning = { slug, size: parseFloat(getComputedStyle(title).fontSize), names };
	// The page transition is started by the layout's onNavigate, in the same round of callbacks.
	queueMicrotask(() => endWith(document.activeViewTransition, names));
}

/**
 * afterNavigate of the index (before the page transition shows it): the row of the project left
 * gets the name, and comes into view if the page opened above it.
 */
export function returnToIndex() {
	if (!returning) return;
	const { slug, size, names } = returning;
	returning = undefined;
	const title = document.querySelector(`[data-project="${CSS.escape(slug)}"] .title`);
	if (!title || current !== names) return;
	const box = title.getBoundingClientRect();
	if (box.top < 0 || box.bottom > innerHeight) {
		title.scrollIntoView({ block: 'center', behavior: 'instant' });
	}
	names.tag(title, 'project-name');
	const ratio = parseFloat(getComputedStyle(title).fontSize) / size;
	document.documentElement.style.setProperty('--project-name-scale', String(ratio || 1));
}
