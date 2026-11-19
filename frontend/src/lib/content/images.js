/** @import { ImagePath, Page, Picture, PictureMap } from './types.js' */

/**
 * Every project image, optimised by @sveltejs/enhanced-img in several widths.
 * - Formats: AVIF + WebP only. WebP is the `<img>` fallback (all evergreen browsers support it),
 *   so no heavy PNG/JPG is ever written to the build (enhanced-img's default fallback).
 * - Widths above the source width are clamped by imagetools (no upscaling).
 * - Lazy: a page only loads the metadata of the pictures it uses.
 * - `documentation/` holds extracted visuals that are not used yet.
 */
const modules = /** @type {Record<string, () => Promise<Picture>>} */ (
	import.meta.glob(
		['/src/lib/assets/projects/**/*.{png,jpg}', '!/src/lib/assets/projects/*/documentation/**'],
		{
			query: { enhanced: true, w: '3456;2560;1920;1280;860;540', format: 'avif;webp' },
			import: 'default'
		}
	)
);

const ROOT = '/src/lib/assets/projects/';

/**
 * All image paths referenced by a page (drawing + blocks).
 * @param {Page} page
 * @returns {ImagePath[]}
 */
export function collectImages(page) {
	/** @type {Set<ImagePath>} */
	const paths = new Set();
	if (page.drawing) paths.add(page.drawing.image);

	for (const block of page.blocks) {
		switch (block.type) {
			case 'screens':
			case 'gallery':
				for (const item of block.items) paths.add(item.image);
				break;
			case 'beforeAfter':
				for (const item of block.pages) paths.add(item.image);
				break;
			case 'beforeAfterReveal':
				for (const pair of block.pairs) {
					paths.add(pair.before.image);
					paths.add(pair.after.image);
				}
				break;
			case 'remarks':
			case 'figure':
				paths.add(block.image);
				break;
		}
	}

	return [...paths];
}

/**
 * Loads the pictures of a page. Throws on a missing file, which fails the prerender
 * and therefore `pnpm build`.
 * @param {string} slug   project slug
 * @param {Page} page
 * @param {string} where  human-readable location, for the error message
 * @returns {Promise<PictureMap>}
 */
export async function loadPictures(slug, page, where) {
	const entries = await Promise.all(
		collectImages(page).map(async (path) => {
			const load = modules[`${ROOT}${slug}/${path}`];
			if (!load) {
				throw new Error(
					`Missing image "${path}" referenced in ${where} of project "${slug}". ` +
						`Expected file: src/lib/assets/projects/${slug}/${path}`
				);
			}
			return /** @type {const} */ ([path, await load()]);
		})
	);

	return Object.fromEntries(entries);
}
