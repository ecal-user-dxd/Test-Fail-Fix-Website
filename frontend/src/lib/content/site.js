/**
 * Site-wide interface labels (Martial's, editable — not student texts).
 */
/** @import { GalleryVariant } from './types.js' */

export const site = {
	/**
	 * View of every `gallery` block that does not set its own `variant`:
	 * 'grid' (image grid), 'desk' (photos to drag around, see GalleryDesk) or 'viewer' (one image
	 * at a time with thumbnails, before / after pairs, see GalleryViewer).
	 * @type {GalleryVariant}
	 */
	galleryVariant: "desk",
	/** Document title of the site index. */
	title: "Scan Everything 2026",
	/** Short name shown in the compact header, linked to the site index (its h1). */
	shortTitle: "Scan Everything",
	labels: {
		skipLink: "Skip to content",
		chapters: "Chapters",
		projects: "Projects",
		notFound: "This page does not exist.",
		error: "Something went wrong.",
		backToStart: "Back to the start",
		/** Last slide of a project (end of its Conclusion): small labels above « Index » and the
		   next project's title, and the big word of the link to the site index. */
		allProjects: "All projects",
		nextProject: "Next project",
		index: "Index",
		credits: "Credits",
		authors: "Authors",
		year: "Year",
		documentation: "Documentation",
		pdf: "PDF",
		/** Conclusion credits: Figma, prototypes and other external links of the group. */
		links: "Links",
		/** Read after an external link (screen readers). */
		newTab: "opens in a new tab",
		/** Conclusion: name of the play button on the poster of the group's film (screen readers). */
		playFilm: "Play the film",
		beforeAfter: "Before and after",
		/** Gallery viewer: small label beside the knob of a before / after bar. */
		dragToCompare: "Drag to compare",
		/** Carousel: « Slide 2 of 6 » (live region, pager buttons), « 2 of 6 » (each slide). */
		slide: "Slide",
		of: "of",
		/** Gallery viewer: ends of the range and screen-reader prefix of a pair's images; name of
		 * a viewer without pairs (a viewer with pairs is called `beforeAfter`). */
		before: "Before",
		after: "After",
		viewer: "Image viewer",
		remarks: "Remarks",
		/** Gallery desk (screen readers): name of the photo list, and how to use it. */
		desk: "Photos on a desk",
		deskHint:
			"Drag a photo to move it, or select it to put it on top of the pile in the middle. Arrow keys move the focused photo, Shift + arrow keys move it further.",
		/** Gallery desk: a video among the photos (screen readers): button name before its label,
		   while paused / while playing, and how to use it. */
		deskPlay: "Play the video",
		deskPause: "Pause the video",
		deskVideoHint:
			"Drag the video to move it, or select it to play or pause it where it lies. Arrow keys move the focused video, Shift + arrow keys move it further.",
		/** Gallery desk: small button at the bottom right of a photo (tooltip, and screen-reader name
		   before the photo's alt): enlarges it in the middle of the desk, then puts it back. */
		deskZoomIn: "Zoom in",
		deskZoomOut: "Zoom out",
		/** Gallery desk: icon button (top right) that puts every photo back in place. */
		deskReset: "Put the photos back in place",
		/** Gallery desk: name of the group labels (screen readers), and how a lined-up group works. */
		deskGroups: "Show one group of photos",
		deskGroupHint:
			"Drag a photo to move it, or select it to bring it to the front. Arrow keys move the focused photo, Shift + arrow keys move it further. Select the group again, or press Escape, to put the photos back on the desk.",
	},
};
