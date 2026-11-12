import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { projects } from '#lib/content/projects/index.js';

// No « Scan Everything » index is designed yet: `/` sends visitors to the first project.
// Prerendered as a small HTML page with a meta refresh.
export function load() {
	redirect(307, resolve('/[project]', { project: projects[0].slug }));
}
