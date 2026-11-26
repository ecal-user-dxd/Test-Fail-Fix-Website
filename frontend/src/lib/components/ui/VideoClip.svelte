<!--
	@component
	The `<video>` of a VideoRef, for the desk (GalleryDesk), the only place videos show: inline on
	phones, nothing loads before play but the poster, nothing plays on its own (Martial), the
	H.264 source and, for the videos with speech, the captions track (shown by default).
	Other attributes (`aria-hidden`, media events) go to the element; style it from the parent
	with `:global(video)`.
-->
<script>
	/** @import { HTMLVideoAttributes } from 'svelte/elements' */
	/** @import { VideoRef } from '#lib/content/types.js' */
	import { staticHref } from '#lib/content/routes.js';

	/** @type {{ video: VideoRef } & Omit<HTMLVideoAttributes, 'src' | 'poster' | 'width' | 'height'>} */
	let { video, ...rest } = $props();
</script>

<!-- Captions come with `video.captions`, for the videos with speech. -->
<!-- svelte-ignore a11y_media_has_caption -->
<video
	playsinline
	preload="none"
	poster={staticHref(video.poster)}
	width={video.width}
	height={video.height}
	{...rest}
>
	<source src={staticHref(video.src)} type="video/mp4" />
	{#if video.captions}
		<track kind="captions" src={staticHref(video.captions)} srclang="en" label="English" default />
	{/if}
</video>
