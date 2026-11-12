import { error } from '@sveltejs/kit';
import { getProject } from '#lib/content/projects/index.js';

/** @type {import('./$types').LayoutLoad} */
export function load({ params }) {
	const project = getProject(params.project);
	if (!project) error(404, 'Not found');
	return { project };
}
