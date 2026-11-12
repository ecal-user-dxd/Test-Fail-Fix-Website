/**
 * Registre des projets du site « Scan Everything 2026 ».
 * Pour ajouter un projet : créer `./<slug>.js` (même schéma que rectify.js),
 * déposer ses images dans `src/lib/assets/projects/<slug>/`, puis l'ajouter ici.
 */
import rectify from './rectify.js';

/** @type {import('../types.js').Project[]} */
export const projects = [rectify];

/** @param {string} slug */
export const getProject = (slug) => projects.find((p) => p.slug === slug);
