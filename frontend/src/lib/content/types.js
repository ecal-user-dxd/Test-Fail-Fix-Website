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
 * @property {string} href  path of the file in `static/` (a leading slash is tolerated)
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
 * @typedef {BlockBase & {
 *   type: 'list',
 *   columns: 1 | 2,
 *   items: ListItem[],
 *   legend?: Record<Tone, string>,
 *   showTone?: boolean
 * }} ListBlock
 */

/** @typedef {BlockBase & { type: 'beforeAfter', pages: ImageRef[] }} BeforeAfterBlock */

/** With an odd number of items in 2 columns, the last item spans the full width. */
/**
 * @typedef {BlockBase & {
 *   type: 'gallery',
 *   columns: 1 | 2,
 *   fit: 'cover' | 'contain',
 *   items: ImageRef[]
 * }} GalleryBlock
 */

/** @typedef {BlockBase & { type: 'figure', image: ImagePath, alt: string }} FigureBlock */

/** Reads `project.authors`, `year` and `documentation`. */
/** @typedef {BlockBase & { type: 'credits' }} CreditsBlock */

/**
 * @typedef {HeadlineBlock | TextRowBlock | NumberedRowBlock | ScreensBlock | RemarksBlock
 *   | StatsBlock | ListBlock | BeforeAfterBlock | GalleryBlock | FigureBlock | CreditsBlock} Block
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
