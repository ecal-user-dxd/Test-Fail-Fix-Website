<!--
	@component
	Large image across the content width (1688×997 at 1728, radius 5): Conclusion. Never taller than
	the viewport minus the page margins (Martial).

	With `video` (a page's `video`, placed here by CoverPage) it is the group's film, which arrives
	like the gallery desk (Martial): one screen tall, a card with the side margins, slightly scaled
	down, until it fills the screen; then it opens to the edges and the compact header slides up
	(immersive.svelte.js), until it scrolls away again. The page snaps to it when the scroll stops
	close by, never while the page is at its top (Martial). On a portrait screen it stays a 16:9 card (a full screen frame would be mostly black).
	The poster is cropped to fill the frame, with a play badge. A click swaps it for the Vimeo
	player, which starts the film in the page, whole, centred on black. Nothing from Vimeo loads
	before that click (no script, no cookie: `dnt=1`).
	Settings: `tuning.immersive` (shared with the desk: transition, card margin, scale, shadow).
-->
<script>
	/** @import { ImagePath, VideoLink } from '#lib/content/types.js' */
	import { untrack } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { immersive, openTransition, scrolled } from '#lib/components/layout/immersive.svelte.js';
	import Picture from '#lib/components/ui/Picture.svelte';
	import { site } from '#lib/content/site.js';
	import { tuning } from '#lib/tuning/tuning.svelte.js';

	/**
	 * @typedef {object} Props
	 * @property {ImagePath} image
	 * @property {string} alt
	 * @property {VideoLink} [video]
	 * @property {boolean} [priority]
	 */

	/** @type {Props} */
	let { image, alt, video, priority = false } = $props();

	/** Share of the film on screen to open it, and to close it again (as the gallery desk). */
	const FOCUS_IN = 0.9;
	const FOCUS_OUT = 0.75;

	/** A portrait screen keeps the film as a 16:9 card: no full screen, the header stays. */
	const landscape = new MediaQuery('orientation: landscape');

	let playing = $state(false);
	/** Fills the screen: open to the edges, header away. */
	let focused = $state(false);
	/** @type {HTMLDivElement | undefined} */
	let film = $state();
	/** @type {HTMLIFrameElement | undefined} */
	let frame = $state();
	/**
	 * A snap point only once the page has left its top (see `scrolled`): close below the title, it
	 * would otherwise be snapped to on load or on a click, skipping the title and headline.
	 */
	const snaps = $derived(scrolled.current);

	/**
	 * Player URL from a Vimeo page link: `vimeo.com/<id>` or, for an unlisted film,
	 * `vimeo.com/<id>/<hash>` (the hash becomes `h`). Other query parameters are dropped.
	 */
	const player = $derived.by(() => {
		const match = video?.href.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]+))?/i);
		if (!match) return '';
		const params = new URLSearchParams({ autoplay: '1', dnt: '1', title: '0', byline: '0', portrait: '0' });
		if (match[2]) params.set('h', match[2]);
		return `https://player.vimeo.com/video/${match[1]}?${params}`;
	});

	$effect(() => {
		if (!film) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!landscape.current) focused = false;
				else if (entry.intersectionRatio >= FOCUS_IN) focused = true;
				else if (entry.intersectionRatio < FOCUS_OUT) focused = false;
			},
			{ threshold: [0, FOCUS_OUT, FOCUS_IN] }
		);
		observer.observe(film);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!focused) return;
		untrack(() => immersive.count++);
		return () => untrack(() => immersive.count--);
	});

	// Keyboard users land in the player once it replaces the button they pressed, and the film
	// is brought to fill the screen.
	$effect(() => {
		if (!playing || !frame) return;
		frame.focus({ preventScroll: true });
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		film?.scrollIntoView({ block: 'start', behavior: still ? 'instant' : 'smooth' });
	});
</script>

{#if video && player}
	<div
		class={['film', focused && 'focused', snaps && 'snaps']}
		data-film
		bind:this={film}
		style={openTransition()}
		style:--card-margin="calc(var(--margin-base) * {tuning.immersive.cardMargin / 20})"
		style:--card-scale={tuning.immersive.cardScale}
		style:--inner-shadow={tuning.immersive.innerShadow}
		style:--inner-blur={tuning.immersive.innerShadowBlur}
		style:--inner-y={tuning.immersive.innerShadowY}
	>
		{#if playing}
			<iframe
				bind:this={frame}
				src={player}
				title={video.label}
				allow="autoplay; fullscreen; picture-in-picture"
				allowfullscreen
			></iframe>
		{:else}
			<button type="button" class="poster" onclick={() => (playing = true)}>
				<Picture src={image} alt="" ratio={16 / 9} sizes="100vw" {priority} />
				<span class="badge" aria-hidden="true">
					<svg viewBox="0 0 24 24" focusable="false"><path d="M8 5v14l11-7z" /></svg>
				</span>
				<span class="sr-only">{site.labels.playFilm}: {video.label}</span>
			</button>
		{/if}
	</div>
{:else}
	<div class="figure">
		<Picture src={image} {alt} ratio={1688 / 997} sizes="calc(100vw - 40px)" {priority} />
	</div>
{/if}

<style>
	.figure {
		padding-inline: var(--margin);
		--picture-radius: var(--radius-screen);
	}

	/* Same rule as the film (Martial): full width, never taller than the viewport, so the margin
	   above and below matches the side margins; the photo is cropped to fill. */
	.figure :global(.picture) {
		width: 100%;
		max-height: calc(100svh - 2 * var(--margin));
	}

	/* One screen tall, black behind the player. Out of focus: a card, clipped to the side margins
	   and corners of the big image and slightly scaled down; in focus: open to the edges, full
	   size (as the gallery desk). */
	.film {
		position: relative;
		height: 100svh;
		overflow: hidden;
		background: var(--color-ink);
		clip-path: inset(0 var(--card-margin) round var(--radius-screen));
		scale: var(--card-scale);
		transition:
			clip-path var(--open-duration) var(--open-ease),
			scale var(--open-duration) var(--open-ease);
	}

	.snaps {
		scroll-snap-align: start;
	}

	@media (orientation: portrait) {
		.film {
			height: auto;
			aspect-ratio: 16 / 9;
		}
	}

	.focused {
		clip-path: inset(0 round 0);
		scale: 1;
	}

	/* Out of focus the card lies sunk into the page (inner shadow), as the desk; it fades out as
	   the film opens. Above the poster and the player, never in the way of a click. */
	.film::before {
		content: '';
		position: absolute;
		inset: 0 var(--card-margin);
		z-index: 1;
		border-radius: var(--radius-screen);
		box-shadow: inset 0 calc(var(--inner-y) * var(--u)) calc(var(--inner-blur) * var(--u))
			rgb(0 0 0 / var(--inner-shadow));
		pointer-events: none;
		transition:
			inset var(--open-duration) var(--open-ease),
			opacity var(--open-duration) var(--open-ease);
	}

	.focused::before {
		inset: 0;
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.film,
		.film::before {
			transition: none;
		}
	}

	/* Snap to the film when the scroll stops near it (proximity: the rest of the page scrolls
	   freely). Not with reduced motion: the page would move by itself. */
	:global(html:has([data-film])) {
		scroll-snap-type: y proximity;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html:has([data-film])) {
			scroll-snap-type: none;
		}
	}

	.poster,
	iframe {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
	}

	/* The poster fills the frame, whatever its ratio (Picture sets its own inline ratio). */
	.poster :global(.picture) {
		height: 100%;
		aspect-ratio: auto !important;
	}

	/* Inside the visible part of the card. */
	.poster:focus-visible {
		outline-offset: calc(-4px - var(--card-margin));
	}

	.focused .poster:focus-visible {
		outline-offset: -4px;
	}

	/* Round play badge in the middle of the poster (160 at 1728). */
	.badge {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		width: max(4rem, calc(160 * var(--u)));
		aspect-ratio: 1;
		margin: auto;
		border-radius: 50%;
		background: var(--color-accent);
		color: var(--color-ink);
		transition:
			scale var(--duration-hover) var(--ease-fade),
			background-color var(--duration-hover);
	}

	.badge svg {
		width: 40%;
		height: 40%;
		fill: currentColor;
		/* The triangle's optical centre is right of its box centre. */
		translate: 5% 0;
	}

	.poster:hover .badge {
		scale: 1.06;
		background: var(--color-paper);
	}
</style>
