/**
 * Registre des projets du site « Scan Everything 2026 ».
 * Pour ajouter un projet : créer `./<slug>.js` (même schéma que rectify.js),
 * déposer ses images dans `src/lib/assets/projects/<slug>/`, puis l'ajouter ici.
 */
import drawScanExplore from './draw-scan-explore.js';
import freshdrop from './freshdrop.js';
import helmetric from './helmetric.js';
import lostAndFound from './lost-and-found.js';
import rectify from './rectify.js';
import returnShelfMachine from './return-shelf-machine.js';

/** @import { Project } from '../types.js' */

/** @type {Project[]} */
export const projects = [rectify, helmetric, freshdrop, returnShelfMachine, drawScanExplore, lostAndFound];

/** @param {string} slug */
export const getProject = (slug) => projects.find((p) => p.slug === slug);

/**
 * @param {Project} project
 * @param {string} slug
 */
export const getChapter = (project, slug) => project.chapters.find((c) => c.slug === slug);
