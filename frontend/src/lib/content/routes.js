import { asset, resolve } from '$app/paths';

/** @import { NavItem, Next, Project } from './types.js' */

/** @param {Project} project */
export const projectHref = (project) => resolve('/[project]', { project: project.slug });

/**
 * @param {Project} project
 * @param {string} chapter  chapter slug
 */
export const chapterHref = (project, chapter) =>
	resolve('/[project]/[chapter]', { project: project.slug, chapter });

/**
 * @param {Project} project
 * @param {Next} next
 */
export const nextHref = (project, next) =>
	next.to ? chapterHref(project, next.to) : projectHref(project);

/**
 * URL of a file in `static/`, from a content path. `asset()` expects no leading slash since
 * SvelteKit 3; content paths are plain strings, hence the cast.
 * @param {string} path
 */
export const staticHref = (path) =>
	asset(/** @type {import('$app/types').AssetPath} */ (path.replace(/^\/+/, '')));

/**
 * Chapter links shared by the compact header chips and the cover index.
 * @param {Project} project
 * @param {string | null} current  slug of the current chapter, or null on the project home
 * @returns {NavItem[]}
 */
export const chapterNav = (project, current) =>
	project.chapters.map((chapter) => ({
		slug: chapter.slug,
		number: chapter.number,
		label: chapter.title,
		href: chapterHref(project, chapter.slug),
		current: chapter.slug === current
	}));
