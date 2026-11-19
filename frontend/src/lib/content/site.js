/**
 * Site-wide interface labels (Martial's, editable — not student texts).
 */
/** @import { GalleryVariant } from './types.js' */

export const site = {
	/**
	 * View of every `gallery` block that does not set its own `variant`:
	 * 'grid' (image grid) or 'desk' (photos to drag around, see GalleryDesk).
	 * @type {GalleryVariant}
	 */
	galleryVariant: 'desk',
	/** Document title of the site index. */
	title: 'Scan Everything 2026',
	/** Short name shown in the compact header, linked to the site index (its h1). */
	shortTitle: 'Scan Everything',
	labels: {
		skipLink: 'Skip to content',
		chapters: 'Chapters',
		projects: 'Projects',
		notFound: 'This page does not exist.',
		error: 'Something went wrong.',
		backToStart: 'Back to the start',
		credits: 'Credits',
		authors: 'Authors',
		year: 'Year',
		documentation: 'Documentation',
		pdf: 'PDF',
		beforeAfter: 'Before and after',
		/** Carousel: « Slide 2 of 6 » (live region, pager buttons), « 2 of 6 » (each slide). */
		slide: 'Slide',
		of: 'of',
		/** Before → after reveal: ends of the range, screen-reader prefix of each image. */
		before: 'Before',
		after: 'After',
		remarks: 'Remarks',
		/** Gallery desk (screen readers): name of the photo list, and how to use it. */
		desk: 'Photos on a desk',
		deskHint:
			'Drag a photo to move it, or select it to put it on top of the pile in the middle. Arrow keys move the focused photo, Shift + arrow keys move it further.'
	}
};
