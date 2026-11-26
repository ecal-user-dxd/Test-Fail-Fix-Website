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

/**
 * A finding (`title` + `text`) or a list item (`number` + `text`, same shape as ListItem).
 * @typedef {object} BentoItem
 * @property {string} [title]
 * @property {string} [number]
 * @property {string} text  same line breaks as TextRowBlock.text
 */

/** Squircle cards in a bento grid; the card sizes follow from the number of items. */
/** @typedef {BlockBase & { type: 'bento', items: BentoItem[] }} BentoBlock */

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
 * 'grid' = image grid; 'desk' = photos scattered on a desk, to drag around and pile up in the
 * middle; 'viewer' = one image at a time in a WebGL viewer, thumbnails below, before / after pairs
 * revealed with a shader (Martial). `columns` and `fit` only apply to 'grid'.
 * Default: `site.galleryVariant`.
 * @typedef {'grid' | 'desk' | 'viewer'} GalleryVariant
 */

/**
 * A gallery image. `group` (desk and viewer): a label copied from the students' own material
 * (slide titles, caption tags printed on the images, the interface's step bar, headings of their
 * texts; only text set in capitals is put in sentence case), never written by us — sources in
 * docs/desk-legends.md. The photos sharing a label are shown together; the labels are listed in
 * order of first appearance, and a group lines up in the order of the items. `after` (viewer only): the same view after the fix,
 * same framing; the item is then a before / after pair (`image` = before). Grid and desk show
 * `image` only.
 * @typedef {ImageRef & { group?: string, after?: ImageRef, video?: undefined }} GalleryImage
 */

/**
 * A gallery video, `{ video: VideoRef }` in place of the image. Videos only ever show on a desk,
 * among the photos, played in place (Martial): a gallery holding one is always a desk, whatever
 * its `variant`. `group` as for an image.
 * @typedef {{ video: VideoRef, group?: string, image?: undefined, after?: undefined }} GalleryVideo
 */

/** @typedef {GalleryImage | GalleryVideo} GalleryItem */

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

/**
 * A film on Vimeo, shown by a cover page (Conclusion) in place of its first figure: a large poster
 * with a play badge; a click loads the Vimeo player in its place and the film plays in the page.
 * @typedef {object} VideoLink
 * @property {string} href       Vimeo page URL (`vimeo.com/<id>` or `vimeo.com/<id>/<hash>`)
 * @property {ImagePath} poster  a still of the film, optimised like every image
 * @property {string} label      accessible name: what the film shows (not a student text)
 */

/** `video`: set by CoverPage from `Page.video`, not written in content files. */
/** @typedef {BlockBase & { type: 'figure', image: ImagePath, alt: string, video?: VideoLink }} FigureBlock */

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
 * A line of the Conclusion credits: a file in `static/` (downloaded, path as for `Documentation.href`)
 * or an external URL (opens in a new tab). '' hides the line.
 * @typedef {object} CreditLink
 * @property {string} label  the group's own file or link name
 * @property {string} href
 */

/**
 * Reads `project.authors`, `year` and `documentation`. A Conclusion can list every file of the
 * group in `documents` (shown in place of `documentation`) and its Figma, prototypes… in `links`.
 * @typedef {BlockBase & { type: 'credits', documents?: CreditLink[], links?: CreditLink[] }} CreditsBlock
 */

/**
 * @typedef {HeadlineBlock | TextRowBlock | NumberedRowBlock | BentoBlock | ScreensBlock | RemarksBlock
 *   | StatsBlock | ListBlock | BeforeAfterBlock | GalleryBlock | FigureBlock | CreditsBlock} Block
 */

/** @typedef {Block['type']} BlockType */

/* ------------------------------------------------------------------ Pages */

/**
 * @typedef {object} Page
 * @property {Layout} layout
 * @property {Theme} theme
 * @property {Drawing} [drawing]
 * @property {VideoLink} [video]  replaces the first figure block (CoverPage)
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
