/**
 * Isometric plans of the projects (Martial, 26.11.2026): `src/lib/assets/projects/<slug>/iso-plan.svg`,
 * black hairline strokes, one per project, found by convention (no content field). Inlined as raw
 * SVG so the opening animation can draw each stroke (#lib/components/layout/ProjectIntro.svelte)
 * and the project home can show the same drawing in its top-right corner (CoverHeader).
 */

const plans = /** @type {Record<string, string>} */ (
	import.meta.glob('/src/lib/assets/projects/*/iso-plan.svg', {
		query: '?raw',
		import: 'default',
		eager: true
	})
);

/**
 * @param {string} slug  project slug
 * @returns {string | undefined}  the SVG markup, or undefined when the project has none
 */
export const isoPlan = (slug) => plans[`/src/lib/assets/projects/${slug}/iso-plan.svg`];
