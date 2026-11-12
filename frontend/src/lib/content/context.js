import { createContext } from 'svelte';

/** @import { Picture, Project } from './types.js' */

/**
 * Picture lookup for the current page, set by the page templates.
 * A function (not a map) so that it always reads the latest page data after client navigation.
 * @type {[() => (path: string) => Picture, (lookup: (path: string) => Picture) => (path: string) => Picture, () => boolean]}
 */
const pictures = createContext();
export const [getPictures, setPictures] = pictures;

/**
 * Current project, for blocks that read project-level data (Credits).
 * @type {[() => () => Project, (get: () => Project) => () => Project, () => boolean]}
 */
const project = createContext();
export const [getProject, setProject] = project;
