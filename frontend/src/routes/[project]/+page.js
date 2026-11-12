import { loadPictures } from '#lib/content/images.js';
import { projects } from '#lib/content/projects/index.js';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return projects.map((project) => ({ project: project.slug }));
}

/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
	const { project } = await parent();
	return { pictures: await loadPictures(project.slug, project.home, 'home') };
}
