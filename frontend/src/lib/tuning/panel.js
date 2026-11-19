/**
 * Dev-only tuning panel (lil-gui). One folder per section of `values.json`, each with its own
 * « Save » (writes that section to the file) and « Revert » (back to its last save). A dot in a
 * folder title marks unsaved changes. Mounted by the root layout in `pnpm dev` only.
 *
 * New section: add its values to `values.json`, then its controls below.
 */
import GUI from 'lil-gui';
import { saved, saveSection, tuning } from './tuning.svelte.js';

/** @typedef {import('./tuning.svelte.js').Tuning} Tuning */
/**
 * No range = checkbox; `color` = colour picker (hex string).
 * @typedef {{ label: string, min?: number, max?: number, step?: number, color?: boolean }} Control
 */

/** @type {{ [S in keyof Tuning]: { title: string, controls: Record<keyof Tuning[S], Control> } }} */
const SECTIONS = {
	postIt: {
		title: 'Post-its',
		controls: {
			enabled: { label: 'Face the pointer' },
			maxTurn: { label: 'Max turn (°)', min: 0, max: 45, step: 0.5 },
			depth: { label: 'Depth (px)', min: 100, max: 2000, step: 10 },
			speed: { label: 'Follow speed', min: 1, max: 30, step: 0.5 },
			perspective: { label: 'Perspective', min: 200, max: 3000, step: 10 },
			light: { label: 'Light', min: 0, max: 4, step: 0.1 },
			shadowShift: { label: 'Shadow shift', min: 0, max: 2, step: 0.05 }
		}
	},
	desk: {
		title: 'Gallery desk',
		controls: {
			grid: { label: 'Grid' },
			spacing: { label: 'Spacing (px at 1728)', min: 4, max: 200, step: 1 },
			lineWidth: { label: 'Line width (px)', min: 0.5, max: 8, step: 0.5 },
			lineColor: { label: 'Line colour', color: true },
			lineOpacity: { label: 'Line opacity', min: 0, max: 1, step: 0.01 },
			background: { label: 'Background (white pages)', color: true },
			inertia: { label: 'Throw (0 = off)', min: 0, max: 3, step: 0.05 },
			friction: { label: 'Friction (1/s)', min: 0.5, max: 20, step: 0.5 },
			bounce: { label: 'Edge bounce', min: 0, max: 1, step: 0.05 }
		}
	}
};

/** @returns {() => void} removes the panel */
export function mountTuningPanel() {
	const gui = new GUI({ title: 'Tuning' });

	for (const section of /** @type {(keyof Tuning)[]} */ (Object.keys(SECTIONS))) {
		const { title, controls } = SECTIONS[section];
		const values = /** @type {Record<string, number | boolean | string>} */ (tuning[section]);
		const folder = gui.addFolder(title);

		for (const [key, { label, min, max, step, color }] of Object.entries(controls)) {
			const control = color ? folder.addColor(values, key) : folder.add(values, key, min, max, step);
			// `listen` keeps the display in sync when values change elsewhere (revert, file edit).
			control.name(label).listen();
		}

		const isDirty = () => {
			const last = /** @type {Record<string, number | boolean | string>} */ (saved[section]);
			return Object.keys(controls).some((key) => values[key] !== last[key]);
		};
		const showState = () => folder.title(isDirty() ? `${title} •` : title);

		const actions = {
			async save() {
				saveButton.disable().name('Saving…');
				try {
					await saveSection(section);
					saveButton.name('Saved ✓');
				} catch (error) {
					console.error(`[tuning] Could not save « ${section} »`, error);
					saveButton.name('Save failed (see console)');
				}
				saveButton.enable();
				showState();
				setTimeout(() => saveButton.name('Save'), 1500);
			},
			revert() {
				Object.assign(values, saved[section]);
				showState();
			}
		};
		const saveButton = folder.add(actions, 'save').name('Save');
		folder.add(actions, 'revert').name('Revert to saved');
		folder.onChange(showState);
	}

	return () => gui.destroy();
}
