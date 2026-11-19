/**
 * Content model of the « Scan Everything 2026 » site (see docs/BRIEF.md §6).
 * Typedefs only: this module exports nothing at runtime.
 *
 * Student texts are verbatim. Only `alt` fields and interface labels (Next.label…) are Martial's.
 */

/** @typedef {'orange' | 'white'} Theme */
/** @typedef {'cover' | 'chapter'} Layout */

/**
 * Image path relative to `src/lib/assets/projects/<slug>/`, e.g. 'screens/fix12-before.png'.
 * @typedef {string} ImagePath
 */

/**
 * @typedef {object} ImageRef
 * @property {ImagePath} image
 * @property {string} alt  '' for decorative images
 */

/**
 * @typedef {object} Documentation
 * @property {string} label
 * @property {string} href  path of the file in `static/` (a leading slash is tolerated); '' hides the credits row
 */

/**
 * @typedef {object} Drawing
 * @property {ImagePath} image
 * @property {'center' | 'corner'} placement
 * @property {string} alt
 */

/**
 * Link to the next chapter, rendered by NextChapter.
 * @typedef {object} Next
 * @property {string} label            interface label (Martial)
 * @property {string} number           '' when there is none
 * @property {string} title
 * @property {string} to               chapter slug; '' = project home
 * @property {'right' | 'up'} [arrow]  defaults to 'right'
 */

/* ------------------------------------------------------------------ Blocks */

/**
 * Fields shared by every block.
 * @typedef {object} BlockBase
 * @property {'top' | 'bottom'} [rule]  optional full-bleed rule
 */

/** @typedef {BlockBase & { type: 'headline', text: string }} HeadlineBlock */

/** `label` may be '' (no heading). In `text`, '\n\n' separates paragraphs and '\n' breaks a line. */
/** @typedef {BlockBase & { type: 'textRow', label: string, text: string }} TextRowBlock */

/** @typedef {BlockBase & { type: 'numberedRow', number: string, title: string, text: string }} NumberedRowBlock */

/** @typedef {BlockBase & { type: 'screens', items: ImageRef[] }} ScreensBlock */

/**
 * @typedef {object} RemarkPoint
 * @property {string} number
 * @property {number} x               centre of the disc, % of the screen width
 * @property {number} y               centre of the disc, % of the screen height
 * @property {'left' | 'right'} side  column holding the text
 * @property {string} text
 */

/** @typedef {BlockBase & { type: 'remarks', image: ImagePath, alt: string, points: RemarkPoint[] }} RemarksBlock */

/**
 * @typedef {object} StatItem
 * @property {string} value
 * @property {string} label
 * @property {string} [note]
 */

/** `label` is the accessible title of the band (not displayed). */
/** @typedef {BlockBase & { type: 'stats', label?: string, items: StatItem[] }} StatsBlock */

/** @typedef {'worked' | 'didnt'} Tone */

/**
 * @typedef {object} ListItem
 * @property {string} number
 * @property {string} text
 * @property {Tone} [tone]
 */

/**
 * 'postits' = post-it board grouped by `tone`, `legend` as titles: the default when any item has
 * a tone. 'rows' = ruled list: the default otherwise, or set it to keep a toned list ruled.
 * @typedef {'rows' | 'postits'} ListVariant
 */

/**
 * @typedef {BlockBase & {
 *   type: 'list',
 *   columns: 1 | 2,
 *   items: ListItem[],
 *   legend?: Record<Tone, string>,
 *   showTone?: boolean,
 *   variant?: ListVariant
 * }} ListBlock
 */

/** @typedef {BlockBase & { type: 'beforeAfter', pages: ImageRef[] }} BeforeAfterBlock */

/**
 * One before → after comparison: two images of the same framing (same ratio).
 * @typedef {object} RevealPair
 * @property {ImageRef} before
 * @property {ImageRef} after
 */

/**
 * WebGL fork of the carousel (Martial): one viewer, each pair turning from before to after with a
 * radial shader reveal; thumbnails below switch pairs.
 * @typedef {BlockBase & { type: 'beforeAfterReveal', pairs: RevealPair[] }} BeforeAfterRevealBlock
 */

/**
 * 'grid' = image grid; 'desk' = photos scattered on a desk, to drag around and pile up in the
 * middle (`columns` and `fit` are then ignored). Default: `site.galleryVariant`.
 * @typedef {'grid' | 'desk'} GalleryVariant
 */

/**
 * A gallery image. `group` (desk only, Martial's label, not a student text): the photos sharing a
 * label are shown together; the labels are listed on the desk in order of first appearance, and
 * a group lines up in the order of the items.
 * @typedef {ImageRef & { group?: string }} GalleryItem
 */

/** With an odd number of items in 2 columns, the last item spans the full width. */
/**
 * @typedef {BlockBase & {
 *   type: 'gallery',
 *   columns: 1 | 2,
 *   fit: 'cover' | 'contain',
 *   items: GalleryItem[],
 *   variant?: GalleryVariant
 * }} GalleryBlock
 */

/** @typedef {BlockBase & { type: 'figure', image: ImagePath, alt: string }} FigureBlock */

/**
 * A video in `static/` (paths as for `Documentation.href`): H.264 MP4 re-encoded from the group's
 * file (1080p max, `+faststart`), a WebP poster frame, and its pixel size.
 * @typedef {object} VideoRef
 * @property {string} src
 * @property {string} poster
 * @property {number} width
 * @property {number} height
 * @property {string} label       accessible name: what the video shows (not a student text)
 * @property {string} [captions]  WebVTT file, for videos with speech
 */

/**
 * Videos in the gallery grid, at their own ratio, with native controls. No autoplay.
 * With an odd number of items in 2 columns, the last item spans the full width.
 * @typedef {BlockBase & { type: 'video', columns: 1 | 2, items: VideoRef[] }} VideoBlock
 */

/** Reads `project.authors`, `year` and `documentation`. */
/** @typedef {BlockBase & { type: 'credits' }} CreditsBlock */

/**
 * @typedef {HeadlineBlock | TextRowBlock | NumberedRowBlock | ScreensBlock | RemarksBlock
 *   | StatsBlock | ListBlock | BeforeAfterBlock | BeforeAfterRevealBlock | GalleryBlock | FigureBlock
 *   | VideoBlock | CreditsBlock} Block
 */

/** @typedef {Block['type']} BlockType */

/* ------------------------------------------------------------------ Pages */

/**
 * @typedef {object} Page
 * @property {Layout} layout
 * @property {Theme} theme
 * @property {Drawing} [drawing]
 * @property {Block[]} blocks
 * @property {Next} next
 */

/**
 * @typedef {Page & {
 *   slug: string,
 *   number: string,
 *   title: string,
 *   figma?: string
 * }} Chapter
 */

/**
 * @typedef {object} Project
 * @property {string} slug
 * @property {string} title
 * @property {string} edition        e.g. 'Scan Everything 2026'
 * @property {string[]} authors
 * @property {string} year
 * @property {Documentation} documentation
 * @property {string} [accent]       CSS colour overriding --color-accent
 * @property {Page} home
 * @property {Chapter[]} chapters
 * @property {Record<string, unknown>} [extra]  group info the template does not show (yet), kept verbatim
 */

/* ------------------------------------------------------------------ Runtime */

/** Output of an `?enhanced` import (vite-imagetools `as=picture`). */
/** @typedef {import('@sveltejs/enhanced-img').Picture} Picture */

/** Pictures loaded for one page, keyed by ImagePath. */
/** @typedef {Record<ImagePath, Picture>} PictureMap */

/**
 * @typedef {object} NavItem
 * @property {string} slug
 * @property {string} number
 * @property {string} label
 * @property {string} href
 * @property {boolean} current
 */

export {};
