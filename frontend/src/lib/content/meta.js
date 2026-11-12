/** @import { Chapter, Page, Project } from './types.js' */

/**
 * « Fail — Rectify — Scan Everything 2026 », or « Rectify — Scan Everything 2026 » on the project home.
 * @param {Project} project
 * @param {Chapter} [chapter]
 */
export const pageTitle = (project, chapter) =>
	[chapter?.title, project.title, project.edition].filter(Boolean).join(' — ');

/**
 * First sentence of the page headline, or of its first text row (project home).
 * Cut at a sentence end only, never inside a sentence (brief §13).
 * @param {Page} page
 */
export function pageDescription(page) {
	const source = page.blocks.find((block) => block.type === 'headline' || block.type === 'textRow');
	if (!source || !('text' in source)) return '';
	const text = source.text.split('\n')[0];
	return text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
}
