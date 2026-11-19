/**
 * Tuning values for motion and effects, by section. The saved values live in `values.json`
 * (committed, used as is by the build). In `pnpm dev`, the tuning panel (`panel.js`) changes
 * them live and saves one section at a time back to that file (`vite-plugin-tuning.js`).
 */
import savedValues from './values.json';

/** @typedef {typeof savedValues} Tuning */
/** @typedef {keyof Tuning} TuningSection */

/** Last saved values, by section. */
export const saved = structuredClone(savedValues);

/** Live values, by section. Read them where the effect runs (each frame, each event). */
export const tuning = $state(structuredClone(savedValues));

/**
 * Writes the live values of one section to `values.json`. Dev server only.
 * @param {TuningSection} section
 */
export async function saveSection(section) {
	const response = await fetch('/__tuning', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ section, values: tuning[section] })
	});
	if (!response.ok) throw new Error(await response.text());
	saved[section] = await response.json();
}

if (import.meta.hot) {
	// `values.json` changed on disk (a save, or a hand edit): apply only the sections whose
	// saved values changed, so unsaved changes in the other sections survive. Values are
	// assigned in place: the panel stays bound to the same objects.
	import.meta.hot.accept('./values.json', (module) => {
		if (!module) return;
		const next = /** @type {Tuning} */ (module.default);
		for (const section of /** @type {TuningSection[]} */ (Object.keys(next))) {
			if (JSON.stringify(next[section]) === JSON.stringify(saved[section])) continue;
			// Same section on both sides; the cast spares TS a union of every section's shape.
			/** @type {Record<TuningSection, unknown>} */ (saved)[section] = structuredClone(next[section]);
			Object.assign(tuning[section], next[section]);
		}
	});
}
