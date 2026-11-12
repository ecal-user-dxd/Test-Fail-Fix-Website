/**
 * Registre des projets du site « Scan Everything 2026 ».
 * Pour ajouter un projet : créer `./<slug>.js` (même schéma que rectify.js),
 * déposer ses images dans `src/lib/assets/projects/<slug>/`, puis l'ajouter ici.
 */
import rectify from './rectify.js';

/** @import { Project } from '../types.js' */

/** @type {Project[]} */
export const projects = [rectify];

/** @param {string} slug */
export const getProject = (slug) => projects.find((p) => p.slug === slug);

/**
 * @param {Project} project
 * @param {string} slug
 */
export const getChapter = (project, slug) => project.chapters.find((c) => c.slug === slug);
