/**
 * Full-screen blocks in focus (the gallery desk once it fills the screen). While any is, the
 * compact header slides up out of the way. A block adds 1 while in focus and removes it after,
 * in client effects only: the server render always shows the header.
 *
 * Settings: `tuning.immersive` (`#lib/tuning/values.json`, live in the dev tuning panel): duration
 * and curve of the open / close transition (block and header move together), side margin and
 * scale of the block while it is a card.
 */
import { tuning } from '#lib/tuning/tuning.svelte.js';

export const immersive = $state({ count: 0 });

/**
 * Duration and easing of the open / close transition, as CSS custom properties
 * (`--open-duration`, `--open-ease`) for a `style` attribute. Reactive where it is read.
 */
export function openTransition() {
	const { duration, ease, x1, y1, x2, y2 } = tuning.immersive;
	const curve = ease === 'custom' ? `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})` : ease;
	return `--open-duration: ${duration}ms; --open-ease: ${curve};`;
}
