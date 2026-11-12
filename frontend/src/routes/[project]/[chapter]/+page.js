import { error } from '@sveltejs/kit';
import { loadPictures } from '#lib/content/images.js';
import { getChapter, projects } from '#lib/content/projects/index.js';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return projects.flatMap((project) =>
		project.chapters.map((chapter) => ({ project: project.slug, chapter: chapter.slug }))
	);
}

/** @type {import('./$types').PageLoad} */
export async function load({ parent, params }) {
	const { project } = await parent();
	const chapter = getChapter(project, params.chapter);
	if (!chapter) error(404, 'Not found');

	return {
		chapter,
		pictures: await loadPictures(project.slug, chapter, `chapter "${chapter.slug}"`)
	};
}
