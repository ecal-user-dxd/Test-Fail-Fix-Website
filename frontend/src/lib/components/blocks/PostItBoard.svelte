<!--
	@component
	Post-it board: the default view of a `list` block whose items have a `tone` (all projects).
	Notes are sorted by review type (`tone`) into one group per type, side by side on the two
	halves of the page, each type with its own post-it colour (Figma Fail/Post-it 483:46:
	Praise = green → worked, Pain = yellow → didn't). Items without a known tone are not shown
	(warning in dev).
-->
<script>
	/** @import { ListItem, Tone } from '#lib/content/types.js' */
	import { dev } from '$app/env';
	import { tuning } from '#lib/tuning/tuning.svelte.js';

	/**
	 * @typedef {object} Props
	 * @property {ListItem[]} items
	 * @property {Record<Tone, string>} [legend]  group titles, in display order
	 */

	/** @type {Props} */
	let { items, legend = { worked: 'worked', didnt: 'didn’t work' } } = $props();

	/** Small fixed tilts: the board looks pinned by hand but renders the same every time. */
	const TILTS = [-1.4, 0.9, -0.6, 1.5, -1.1, 0.4, 1.2, -1.7];

	const groups = $derived(
		/** @type {Tone[]} */ (Object.keys(legend)).map((tone) => ({
			tone,
			title: legend[tone],
			notes: items
				.map((item, i) => ({ ...item, tilt: TILTS[i % TILTS.length] }))
				.filter((item) => item.tone === tone)
		}))
	);

	$effect(() => {
		if (!dev) return;
		const hidden = items.filter((item) => !item.tone || !(item.tone in legend));
		if (hidden.length) console.warn('[PostItBoard] Notes without a known tone are not shown', hidden);
	});

	/**
	 * Every note turns in 3D to face the pointer while it moves over the board, then settles
	 * back flat when it leaves. Mouse and pen only; off with `prefers-reduced-motion`.
	 * Writes unitless `--rx` / `--ry` (degrees) on each `.note`.
	 *
	 * Settings: `tuning.postIt` (`#lib/tuning/values.json`, live in the dev tuning panel):
	 * - `depth`: how far in front of the screen the pointer sits, in px (lower = notes turn more);
	 * - `maxTurn`: turn limit on each axis, in degrees;
	 * - `speed`: follow speed, 1/s (higher = snappier, lower = lazier);
	 * - `enabled`: off = notes stay flat.
	 * @type {import('svelte/attachments').Attachment<HTMLElement>}
	 */
	function faceThePointer(board) {
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
		/** @type {WeakMap<HTMLElement, { x: number, y: number }>} */
		const turns = new WeakMap();
		/** @type {{ x: number, y: number } | null} */
		let pointer = null;
		let frame = 0;
		let last = 0;

		/** @param {number} now */
		function step(now) {
			const { enabled, depth, maxTurn, speed } = tuning.postIt;
			const dt = Math.min(Math.max(now - last, 0), 100) / 1000;
			const k = 1 - Math.exp(-speed * dt);
			last = now;

			/** @param {number} radians */
			const turnOf = (radians) => Math.max(-maxTurn, Math.min(maxTurn, (radians * 180) / Math.PI));

			const notes = /** @type {NodeListOf<HTMLElement>} */ (board.querySelectorAll('.note'));
			// Read every position first, then write: no layout thrashing.
			const targets = Array.from(notes, (note) => {
				if (!pointer || !enabled) return { x: 0, y: 0 };
				const box = note.getBoundingClientRect();
				const dx = pointer.x - (box.left + box.width / 2);
				const dy = pointer.y - (box.top + box.height / 2);
				return { x: turnOf(-Math.atan2(dy, depth)), y: turnOf(Math.atan2(dx, depth)) };
			});

			let moving = false;
			notes.forEach((note, i) => {
				const turn = turns.get(note) ?? { x: 0, y: 0 };
				const target = targets[i];
				turn.x += (target.x - turn.x) * k;
				turn.y += (target.y - turn.y) * k;
				if (Math.abs(target.x - turn.x) > 0.01 || Math.abs(target.y - turn.y) > 0.01) moving = true;
				else Object.assign(turn, target);
				turns.set(note, turn);
				note.style.setProperty('--rx', turn.x.toFixed(2));
				note.style.setProperty('--ry', turn.y.toFixed(2));
				// Light: how much the note is turned (0 flat → 1 at 45°), and the screen direction
				// of the edge that goes away (CSS gradient angle: 0 = up, 90 = right).
				note.style.setProperty('--shade', Math.min(Math.hypot(turn.x, turn.y) / 45, 1).toFixed(3));
				note.style.setProperty('--shade-angle', ((Math.atan2(turn.y, turn.x) * 180) / Math.PI).toFixed(1));
			});

			frame = moving ? requestAnimationFrame(step) : 0;
		}

		function start() {
			if (frame) return;
			last = performance.now();
			frame = requestAnimationFrame(step);
		}

		/** @param {PointerEvent} event */
		function onMove(event) {
			if (event.pointerType === 'touch' || reducedMotion.matches) return;
			pointer = { x: event.clientX, y: event.clientY };
			start();
		}

		function onLeave() {
			pointer = null;
			start();
		}

		/** The board moves under a still pointer: aim again. */
		function onScroll() {
			if (pointer) start();
		}

		/** Motion turned off mid-visit: drop the turn at once, no animation. */
		function onMotionChange() {
			if (!reducedMotion.matches) return;
			pointer = null;
			cancelAnimationFrame(frame);
			frame = 0;
			for (const note of board.querySelectorAll('.note')) {
				const style = /** @type {HTMLElement} */ (note).style;
				for (const property of ['--rx', '--ry', '--shade', '--shade-angle']) style.removeProperty(property);
				turns.delete(/** @type {HTMLElement} */ (note));
			}
		}

		board.addEventListener('pointermove', onMove);
		board.addEventListener('pointerleave', onLeave);
		window.addEventListener('scroll', onScroll, { passive: true });
		reducedMotion.addEventListener('change', onMotionChange);

		return () => {
			cancelAnimationFrame(frame);
			board.removeEventListener('pointermove', onMove);
			board.removeEventListener('pointerleave', onLeave);
			window.removeEventListener('scroll', onScroll);
			reducedMotion.removeEventListener('change', onMotionChange);
		};
	}
</script>

<div
	class="board"
	style:--perspective={tuning.postIt.perspective}
	style:--light={tuning.postIt.light}
	style:--shadow-shift={tuning.postIt.shadowShift}
	{@attach faceThePointer}
>
	{#each groups as group (group.tone)}
		<section class="group" data-tone={group.tone}>
			<div class="head">
				<span class="swatch" aria-hidden="true"></span>
				<h3 class="title">{group.title}</h3>
				<span class="count" aria-hidden="true">{String(group.notes.length).padStart(2, '0')}</span>
			</div>
			<ul class="notes">
				{#each group.notes as note (note.number)}
					<li class="note" style:--tilt="{note.tilt}deg">
						<div class="paper">
							<p class="text">{note.text}</p>
							<span class="number">{note.number}</span>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>

<style>
	/* Two halves of 864 at 1728, edge to edge, like the 2-column list. */
	.board {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.group {
		padding-inline: var(--margin);
		border-top: var(--rule);
	}

	[data-tone='worked'] {
		--note-bg: var(--color-note-worked);
	}

	[data-tone='didnt'] {
		--note-bg: var(--color-note-didnt);
	}

	.head {
		display: flex;
		align-items: center;
		gap: calc(20 * var(--u));
		padding-block: calc(22 * var(--u)) calc(26 * var(--u));
	}

	.swatch {
		flex: none;
		width: calc(18 * var(--u));
		height: calc(18 * var(--u));
		background: var(--note-bg);
		box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.12);
	}

	.title {
		font-size: var(--type-label);
		line-height: var(--leading-label);
	}

	/* Legend labels are lowercase in the content (they also serve the list's tone squares). */
	.title::first-letter {
		text-transform: uppercase;
	}

	.count {
		margin-left: auto;
		font-size: var(--type-number);
		line-height: var(--leading-number);
		color: var(--muted);
	}

	.notes {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		align-items: stretch;
		gap: calc(20 * var(--u));
		padding-block: calc(10 * var(--u)) calc(40 * var(--u));
	}

	/* Square at least (Figma 300 × 300), taller if a note needs it; a row shares one height.
	   The slot stays flat on the board (its position aims the turn); the paper turns. */
	.note {
		--muted: var(--color-muted-on-accent);

		position: relative;
		display: grid;
		aspect-ratio: 1;
	}

	/* Shadow on the board plane: it stays flat and slides toward the edge that lifts
	   (the one coming toward the viewer), `--shadow-shift` u per degree of turn.
	   Same values as `--shadow-note` (Figma « drop »: y 3.7, blur 45.75, spread 6.46, 25 %),
	   but as a filled, blurred plate: a box-shadow is hollow and would show a white card
	   behind the paper once it turns. Own layer (`will-change`): the blur is drawn once,
	   then only moved. */
	.note::before {
		content: '';
		position: absolute;
		inset: calc(-6.46 * var(--u));
		background: rgb(0 0 0 / 0.25);
		filter: blur(calc(22.875 * var(--u)));
		transform: translate(
				calc(var(--ry, 0) * var(--shadow-shift, 0) * -1 * var(--u)),
				calc((3.7 + var(--rx, 0) * var(--shadow-shift, 0)) * var(--u))
			)
			rotate(var(--tilt));
		will-change: transform;
	}

	/* In-plane tilt first, then the 3D turn toward the pointer (see faceThePointer),
	   each note with its own vanishing point. */
	.paper {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-20);
		padding: calc(24 * var(--u));
		background: var(--note-bg);
		transform: perspective(calc(var(--perspective, 1000) * var(--u)))
			rotateX(calc(var(--rx, 0) * 1deg)) rotateY(calc(var(--ry, 0) * 1deg)) rotate(var(--tilt));
	}

	/* Light: the edge coming toward the viewer is lit, the edge going away falls into shade.
	   The angle is in screen space, so the paper's own tilt is taken back out. */
	.paper::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			calc(var(--shade-angle, 0) * 1deg - var(--tilt)),
			rgb(255 255 255 / 0.45),
			transparent 50%,
			rgb(0 0 0 / 0.28)
		);
		opacity: calc(var(--shade, 0) * var(--light, 0));
		pointer-events: none;
	}

	.text {
		font-size: var(--type-note);
		line-height: var(--leading-body);
	}

	.number {
		margin-top: auto;
		font-size: var(--type-small);
		line-height: var(--leading-number);
		color: var(--muted);
	}

	@media (max-width: 1279px) {
		.notes {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 767px) {
		.board {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
