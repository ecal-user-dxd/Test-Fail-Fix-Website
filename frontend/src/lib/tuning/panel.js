/**
 * Dev-only tuning panel (lil-gui). One folder per section of `values.json`, each with its own
 * « Save » (writes that section to the file) and « Revert » (back to its last save). A dot in a
 * folder title marks unsaved changes. Mounted by the root layout in `pnpm dev` only.
 * H hides / shows the panel (remembered in this browser).
 *
 * New section: add its values to `values.json`, then its controls below.
 */
import GUI from 'lil-gui';
import { saved, saveSection, tuning } from './tuning.svelte.js';

/** @typedef {import('./tuning.svelte.js').Tuning} Tuning */
/**
 * No range = checkbox; `color` = colour picker (hex string); `options` = dropdown (label → value).
 * @typedef {{ label: string, min?: number, max?: number, step?: number, color?: boolean,
 *   options?: Record<string, string> }} Control
 */

/** Curves of the full-screen transition: the site's own, the usual ones, then custom (sliders). */
const CURVES = {
	'Ease in-out (site)': 'ease-in-out',
	'Ease out': 'ease-out',
	Ease: 'ease',
	Linear: 'linear',
	'Sine in-out': 'cubic-bezier(0.37, 0, 0.63, 1)',
	'Cubic in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
	'Quint in-out': 'cubic-bezier(0.83, 0, 0.17, 1)',
	'Expo in-out': 'cubic-bezier(0.87, 0, 0.13, 1)',
	'Cubic out': 'cubic-bezier(0.33, 1, 0.68, 1)',
	'Quint out': 'cubic-bezier(0.22, 1, 0.36, 1)',
	'Expo out': 'cubic-bezier(0.16, 1, 0.3, 1)',
	'Back out (overshoot)': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
	'Custom (x1 y1 x2 y2 below)': 'custom'
};

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
			bounce: { label: 'Bounce (top / bottom)', min: 0, max: 1, step: 0.05 },
			arrive: { label: 'Arrival' },
			arriveDuration: { label: 'Arrival (ms)', min: 200, max: 3000, step: 50 },
			arriveStagger: { label: 'Arrival stagger (ms)', min: 0, max: 400, step: 10 },
			arriveScale: { label: 'Arrival scale (start)', min: 0.5, max: 2, step: 0.01 }
		}
	},
	immersive: {
		title: 'Full screen (desk)',
		controls: {
			duration: { label: 'Open / close (ms)', min: 0, max: 2000, step: 10 },
			ease: { label: 'Curve', options: CURVES },
			x1: { label: 'Custom x1', min: 0, max: 1, step: 0.01 },
			y1: { label: 'Custom y1', min: -1, max: 2, step: 0.01 },
			x2: { label: 'Custom x2', min: 0, max: 1, step: 0.01 },
			y2: { label: 'Custom y2', min: -1, max: 2, step: 0.01 },
			cardMargin: { label: 'Card margin (px, desktop)', min: 0, max: 200, step: 1 },
			cardScale: { label: 'Card scale', min: 0.8, max: 1, step: 0.005 }
		}
	},
	reveal: {
		title: 'Before / after (WebGL)',
		controls: {
			tilt: { label: 'Tilt (°)', min: 0, max: 20, step: 0.5 },
			perspective: { label: 'Camera distance (× width)', min: 0.5, max: 5, step: 0.05 },
			tiltSpeed: { label: 'Tilt speed', min: 1, max: 30, step: 0.5 },
			highlight: { label: 'Highlight', min: 0, max: 0.5, step: 0.01 },
			followSpeed: { label: 'Drag follow speed', min: 2, max: 40, step: 1 },
			playDuration: { label: 'Click: play (ms)', min: 200, max: 4000, step: 50 },
			swapDuration: { label: 'Thumbnail: swap (ms)', min: 200, max: 4000, step: 50 },
			frontWidth: { label: 'Front: shading width', min: 0.02, max: 0.4, step: 0.005 },
			edgeSoftness: { label: 'Front: edge softness', min: 0.001, max: 0.1, step: 0.001 },
			darken: { label: 'Before side: darken', min: 0, max: 1, step: 0.01 },
			shadow: { label: 'After side: shadow', min: 0, max: 1, step: 0.01 },
			rim: { label: 'Front: light rim', min: 0, max: 1, step: 0.01 },
			push: { label: 'Front: push', min: 0, max: 0.2, step: 0.005 },
			split: { label: 'Front: colour split', min: 0, max: 1, step: 0.01 },
			ripple: { label: 'Front: ripple', min: 0, max: 0.5, step: 0.01 },
			rippleSpeed: { label: 'Ripple speed', min: 0, max: 2, step: 0.05 }
		}
	}
};

/** Remembers, in this browser only, whether the panel is hidden. */
const HIDDEN_KEY = 'tuning-panel-hidden';

function wasHidden() {
	try {
		return localStorage.getItem(HIDDEN_KEY) === '1';
	} catch {
		return false;
	}
}

/** @param {boolean} hidden */
function rememberHidden(hidden) {
	try {
		localStorage.setItem(HIDDEN_KEY, hidden ? '1' : '0');
	} catch {
		// Storage blocked: the panel just won't remember.
	}
}

/** @returns {() => void} removes the panel */
export function mountTuningPanel() {
	const gui = new GUI({ title: 'Tuning' });

	// Hide / show: the H key, or the button at the top of the panel. Survives reloads.
	let hidden = false;
	/** @param {boolean} hide */
	const setHidden = (hide) => {
		hidden = hide;
		gui.show(!hide);
		rememberHidden(hide);
	};
	gui.add({ hide: () => setHidden(true) }, 'hide').name('Hide panel (H)');
	if (wasHidden()) {
		setHidden(true);
		console.info('[tuning] Panel hidden: press H to show it.');
	}

	/** @param {KeyboardEvent} event */
	const onKeydown = (event) => {
		if (event.key !== 'h' && event.key !== 'H') return;
		if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
		// Not while typing (the panel's own number fields included).
		const target = /** @type {Element | null} */ (event.target);
		if (target?.closest?.('input, textarea, select, [contenteditable]')) return;
		setHidden(!hidden);
	};
	window.addEventListener('keydown', onKeydown);

	for (const section of /** @type {(keyof Tuning)[]} */ (Object.keys(SECTIONS))) {
		const { title, controls } = SECTIONS[section];
		const values = /** @type {Record<string, number | boolean | string>} */ (tuning[section]);
		const folder = gui.addFolder(title);

		for (const [key, { label, min, max, step, color, options }] of Object.entries(controls)) {
			const control = color
				? folder.addColor(values, key)
				: options
					? folder.add(values, key, options)
					: folder.add(values, key, min, max, step);
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

	return () => {
		window.removeEventListener('keydown', onKeydown);
		gui.destroy();
	};
}
