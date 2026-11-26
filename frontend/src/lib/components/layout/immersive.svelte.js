/**
 * Full-screen blocks in focus (the gallery desk once it fills the screen). While any is, the
 * compact header slides up out of the way. A block adds 1 while in focus and removes it after,
 * in client effects only: the server render always shows the header.
 *
 * Settings: `tuning.immersive` (`#lib/tuning/values.json`, live in the dev tuning panel): duration
 * and curve of the open / close transition (block and header move together), side margin, scale
 * and inner shadow of the block while it is a card, parallax of the desk's content.
 */
import { createSubscriber } from 'svelte/reactivity';
import { tuning } from '#lib/tuning/tuning.svelte.js';

export const immersive = $state({ count: 0 });

// The page margin is the visible edge of the desk's card (tokens.css `--margin`): the live card
// inset and scale go on the root, so the whole page follows the tuning panel.
if (typeof document !== 'undefined') {
	$effect.root(() => {
		$effect(() => {
			const { cardMargin, cardScale } = tuning.immersive;
			const root = document.documentElement.style;
			root.setProperty('--card-inset', `calc(var(--margin-base) * ${cardMargin / 20})`);
			root.setProperty('--card-scale', String(cardScale));
		});
	});
}

const subscribe = createSubscriber((update) => {
	addEventListener('scroll', update, { passive: true });
	return () => removeEventListener('scroll', update);
});

/**
 * The page has left its top: scrolled more than a quarter of a screen. The full-screen blocks
 * (gallery desk, Conclusion film) are snap points only then (Martial, 26.11.2026): at the top, a
 * click or a small turn of the wheel no longer pulls the page down onto a block that lies close
 * below the title. Read it in a `$derived`, so a block changes only when the answer does.
 */
export const scrolled = {
	get current() {
		if (typeof window === 'undefined') return false;
		subscribe();
		return scrollY > innerHeight / 4;
	}
};

/**
 * Duration and easing of the open / close transition, as CSS custom properties
 * (`--open-duration`, `--open-ease`) for a `style` attribute. Reactive where it is read.
 */
export function openTransition() {
	const { duration, ease, x1, y1, x2, y2 } = tuning.immersive;
	const curve = ease === 'custom' ? `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})` : ease;
	return `--open-duration: ${duration}ms; --open-ease: ${curve};`;
}
