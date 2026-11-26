// Pre-encoded pictures, so a build does not have to encode them again.
//
// enhanced-img (vite-imagetools) turns every picture of src/lib/assets/projects into AVIF + WebP
// in up to six widths. Encoding them all takes about 20 minutes on a 4-core machine like Vercel's.
// vite-imagetools keeps each result in node_modules/.cache/imagetools, under a name that is a hash
// of the picture's bytes and of the requested width and format. `image-cache/` is a committed copy
// of those files, so a fresh clone (or Vercel's first build) reuses them instead of encoding.
//
//   node scripts/image-cache.js restore   image-cache/ → node_modules/.cache/imagetools
//                                          (only files not already there; run before `pnpm build`)
//   node scripts/image-cache.js save      pictures encoded since the last save → image-cache/
//                                          (run after a local `pnpm build`, then commit image-cache/)
//
// A picture that was added or edited has a new hash, so it is not found in the cache and is simply
// encoded during the build. The cache can make a build faster, never put an old picture online.

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const committed = join(root, 'image-cache');
const local = join(root, 'node_modules/.cache/imagetools');

/** Cache entries are 40-character sha1 names, without extension. */
const isEntry = (/** @type {string} */ name) => /^[0-9a-f]{40}$/.test(name);

/** @param {string} dir */
const entries = (dir) => (existsSync(dir) ? readdirSync(dir).filter(isEntry) : []);

/**
 * Copies the entries of `from` that `to` does not have yet.
 * @param {string} from
 * @param {string} to
 * @param {(name: string) => boolean} [keep]
 */
function copyMissing(from, to, keep = () => true) {
	mkdirSync(to, { recursive: true });
	const have = new Set(entries(to));
	let count = 0;
	for (const name of entries(from)) {
		if (have.has(name) || !keep(name)) continue;
		copyFileSync(join(from, name), join(to, name));
		count++;
	}
	return count;
}

const command = process.argv[2];

if (command === 'restore') {
	const count = copyMissing(committed, local);
	console.log(`image-cache: ${count} pre-encoded pictures restored to node_modules/.cache/imagetools`);
} else if (command === 'save') {
	// Only what was encoded after the newest committed file: older entries of the local cache can
	// belong to pictures that have since been replaced, and would only make the repository heavier.
	const newest = Math.max(0, ...entries(committed).map((n) => statSync(join(committed, n)).mtimeMs));
	const count = copyMissing(local, committed, (n) => statSync(join(local, n)).mtimeMs > newest);
	console.log(`image-cache: ${count} newly encoded pictures saved to image-cache/ (commit them)`);
} else {
	console.error('Usage: node scripts/image-cache.js restore|save');
	process.exit(1);
}
