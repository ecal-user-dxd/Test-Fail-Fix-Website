# Brief développeur — « Scan Everything 2026 » · projet *Rectify* (Test → Fail → Fix)

> **À qui :** Claude (Opus 5.5) dans Claude Code.
> **De :** Martial Grin (ECAL, MaDXD), designer du site.
> **Lis ce document en entier avant d'écrire une ligne de code.** Il décrit le projet, la structure du site, le design system, le modèle de contenu, la liste des composants à planifier et l'ordre de travail. Tout ce qui est marqué **[À CONFIRMER]** doit être posé comme question à Martial, pas deviné.

---

## 0. Ta mission et ta façon de travailler

Tu construis en **SvelteKit** le site de documentation d'un projet étudiant : il doit reproduire fidèlement les maquettes Figma (desktop 1728 px), être fluide, accessible, rapide, et facile à étendre à d'autres projets étudiants.

Règles de travail :

1. **Phase 0 d'abord (sans coder) :** lis ce brief, `CLAUDE.md`, le fichier de contenu `frontend/src/lib/content/projects/rectify.js` et les captures `docs/figma/*.png`. Puis livre un **plan écrit** :
   - l'arborescence des routes et des fichiers ;
   - la liste des composants avec leurs props ;
   - le schéma de données (`types.js` en JSDoc) ;
   - tes choix techniques (adapter, images, polices, responsive) ;
   - la liste de tes questions.
   **Ensuite arrête-toi et attends la validation.**
2. Travaille ensuite **phase par phase** (§15). À la fin de chaque phase :
   - `pnpm build` doit passer ;
   - résume ce qui est fait ;
   - montre ce qui reste ;
   - pose les questions ouvertes.
3. Petits commits atomiques, messages clairs (en anglais, impératif). Initialise git si absent.
4. **N'invente jamais de contenu.** Tous les textes viennent du fichier de contenu (déjà rempli, verbatim). S'il manque quelque chose, demande.
5. **Ne corrige jamais les textes des étudiants**, même les fautes (§13).
6. Pas de dépendance ajoutée sans dire pourquoi. Pas de framework CSS, pas de librairie UI.
7. Compare visuellement ton rendu à 1728 px de large avec `docs/figma/*.png`. Si tu as accès au MCP Figma, utilise les node IDs du §2.
8. En cas de doute entre la maquette et ce brief, **la maquette Figma (page `0_Flow`) fait foi pour le visuel**, ce brief fait foi pour la structure, le code et le contenu.

---

## 1. Contexte

- **Cadre :** brief « **Test, Fail, Fix** » du Master Digital Experience Design (MaDXD) de l'ECAL. Les étudiants conçoivent une interface, la testent avec des utilisateurs, puis la retravaillent.
- **Site parent :** « **Scan Everything 2026** ». Il documente plusieurs projets étudiants avec la même logique.
- **Concept (validé par le responsable) :** une métaphore de bureau en trois temps.
  - **Test :** intro, recherche, apparition du design.
  - **Fail :** on voit sur le design, avec des points / cercles, ce qui n'allait pas d'après les tests utilisateurs.
  - **Fix :** avant / après et commentaires.
  - Puis une **Conclusion**.
- **Projet documenté :** **Rectify**, de **Thomas Neyroud** et **Rishab Sachidanand**. C'est une installation pour disquaires : on pose une sélection de vinyles dans une boîte de scan, un écran vertical affiche la sélection en mappings (genre, origine, timeline), chaque album a sa page (description, crédits, extraits audio via une molette), sans déballer le disque.
- **Langue du site :** anglais (`lang="en"`). La documentation pour toi est en français.

---

## 2. Sources de vérité

### 2.1 Figma

Fichier `f9nqzj1fV8H70n2KBJCANh` (« TEST-FAIL-FIX »), page **`0_Flow`** (id `551:579`). C'est la **seule** page de maquettes à implémenter.

| Écran | Frame (node id) | Route |
|---|---|---|
| Accueil projet « Rectify » (orange) | `551:624` | `/rectify` |
| Test | `551:580` | `/rectify/test` |
| Fail | `556:40` | `/rectify/fail` |
| Fix | **`573:4778`** (frame nommée « FIX-2 ») | `/rectify/fix` |
| Conclusion (orange) | `559:237` | `/rectify/conclusion` |
| Variantes de header (référence) | `550:1399` (composant « Index ») | — |

Composants Figma utiles (page `Components`, id `143:60`) :

| Composant Figma | id | Rôle |
|---|---|---|
| `Index` → variante `Property 1=Variant3` | `550:1427` | **Header compact** des pages Test / Fail / Fix |
| `Site/Header` → variantes `Page=Page6` (accueil) et `Page=Home` (conclusion) | `567:180` | **Header « cover »** orange avec index des chapitres |
| `Site/Index item` (Default / Hover / Not Page) | `576:71` | Grand lien de chapitre (100 px) |
| `Site/Text row` | `555:41` | Libellé gris à gauche + texte dans la colonne droite |
| `Site/Numbered row` | `555:44` | Numéro + titre gris + texte |
| `Site/List row` (Tone = Worked / Didnt / None) | `555:64` | Ligne de liste filetée |
| `Site/Stat` | `555:65` | Cellule orange avec grand chiffre |
| `Site/Mark` (Orange / Black) | `555:72` | Disque numéroté 40 px |
| `Fail/Remarks` (R1–R4 On/Off, 16 variantes) | `583:1023` | Page album avec remarques à révéler |
| `Site/Before-after` (Page 1–6) | `579:192` | Avant/après avec petit pager |
| `Site/Page number` (Default / Hover / Active) | `579:58` | Numéro du pager |
| `Site/Next` (Default / Hover) | `567:78` | Lien « Next chapter » géant |

**À ignorer** (explorations ou obsolètes) :
- les pages `Archives`, `Test` (exemple « Helmetric » gris/serif), `Contenu`, `Type de contenu` ;
- la frame `FIX` (`557:130`, ancienne version) ;
- les composants `Site/Chip`, `Site/Anchor`, `Site/Slider`, `Site/Footer`, `Fail/Marker`, `Fail/Post-it`, `Fix/Comment`, `Fix/Pin`, `Navigation` ;
- les variantes `Test / Fail / Fix / Conclusion` de `Site/Header`.

### 2.2 Captures de référence (dans le repo)

`docs/figma/` contient des captures 1:1 à 1728 px de large :

| Fichier | Contenu |
|---|---|
| `01-home-rectify.png` | Accueil projet |
| `02-test.png` | Test |
| `03-fail.png` | Fail |
| `04-fix.png` | Fix |
| `05-conclusion.png` | Conclusion |
| `10-header-variants.png` | Explorations de header |
| `11-fail-remarks-states.png` | Les 16 états des remarques Fail |

### 2.3 Contenu et médias (déjà dans le repo)

- **Contenu structuré :** `frontend/src/lib/content/projects/rectify.js`. Tous les textes sont **verbatim** (extraits des `.rtf`, de la documentation PDF et de la présentation des étudiants), découpés en blocs typés (§6).
- **Images :** `frontend/src/lib/assets/projects/rectify/`.
  - `main-01.png`, `iso-drawing.png` (dessin isométrique en traits noirs **sur fond transparent**, à poser sur l'orange).
  - `test-01…07.png`, `fail-01…10.png`, `fix-01…18.png`, `fix-13-first-version.png`.
  - `screens/` : captures d'écran avant / après détourées, 1069×1900.
  - `documentation/` : visuels extraits du PDF, non utilisés pour l'instant.
  - Les originaux sont lourds (PNG 3840×2160, ~86 Mo au total) : **optimisation obligatoire** (§12).
- **PDF :** `frontend/static/projects/rectify/TFF-RishabThomas-Documentation.pdf` (lien « Documentation » des crédits).
- **Dossier étudiant original (lecture seule, ne pas modifier) :** `~/Documents/ECAL/AS_9/TEST-FAIL_FIX/Test-Fail-Fix/Thomas_Rishab/`.

---

## 3. Stack et contraintes techniques

Le projet est déjà initialisé dans `frontend/` (via `sv create --template minimal --no-types`) :

- **SvelteKit 3**, **Svelte 5** (mode **runes forcé** dans `vite.config.js`), **Vite 8**, gestionnaire **pnpm**.
- **JavaScript + JSDoc** (pas de TypeScript ; `jsconfig.json` en `strict`). Garde ce choix et type avec des `@typedef` JSDoc.
- **Alias d'import `#lib`** (champ `imports` du `package.json`), **pas `$lib`**. Exemple : `import X from '#lib/components/...'`.
- La config SvelteKit est dans `vite.config.js` (plugin `sveltekit({...})`), il n'y a pas de `svelte.config.js`.
- SvelteKit 3 / Svelte 5 étant récents, **vérifie la doc officielle** (https://svelte.dev/llms.txt, ou le MCP Svelte s'il est disponible) au lieu de te fier à des habitudes SvelteKit 1/2. Cela concerne :
  - runes `$props`, `$state`, `$derived`, `$effect` ;
  - snippets et `{@render}` à la place des slots ;
  - `onclick` au lieu de `on:click`.

Exigences :

- **Rendu statique :** remplacer `adapter-auto` par **`@sveltejs/adapter-static`** et prérendre toutes les routes (`export const prerender = true` + `entries()` pour les routes dynamiques). Hébergement **[À CONFIRMER]** (Infomaniak ou ECAL) : le build doit être un dossier statique.
- **CSS :** vanilla CSS, custom properties (tokens), styles scopés par composant, un petit `reset.css`. Pas de Tailwind.
- **Images :** `@sveltejs/enhanced-img` si compatible avec Kit 3 / Vite 8. Sinon `vite-imagetools`, ou un script `sharp` de pré-génération. Formats AVIF/WebP, `srcset`/`sizes`, `width`/`height` explicites.
- **Polices :** voir §4.2. Fichiers web à fournir par Martial **[À CONFIRMER]**.
- Aucune requête tierce (pas de Google Fonts, pas d'analytics) sauf demande.
- Navigateurs evergreen (Chrome, Safari, Firefox récents).

---

## 4. Design system (tokens)

Mesures relevées dans Figma, maquette desktop **1728 px** de large.

### 4.1 Couleurs

| Token | Valeur | Source / usage |
|---|---|---|
| `--color-accent` | `#FF5500` | Variable Figma « Color ». Fond des pages cover (accueil, conclusion), chips du header, bande de stats, disques de remarques, survol du bloc Next |
| `--color-ink` | `#000000` | Texte, filets, disques « lus » |
| `--color-paper` | `#FFFFFF` | Fond des pages chapitre (Test, Fail, Fix) |
| `--color-muted` | `rgb(0 0 0 / .5)` | Libellés gris (Text row, numéros, titres de Numbered row, crédits) |
| `--color-gallery` | `#F2F2F5` | Fond et gouttières des grilles d'images sur fond blanc |
| `--color-placeholder` | `#E6E6EB` | Placeholder image pendant le chargement |
| `--color-grey` | `#D9D9D9` | Variable Figma « Grey » (réserve) |
| `--color-ink-soft` | `#303030` | Variable Figma « Noir Allegé » (réserve) |
| `--color-year` | `#00FF22` | Variable Figma « Color Year », usage inconnu **[À CONFIRMER]** |

Prévois que **la couleur d'accent soit une propriété du projet** (`project.accent`), injectée en CSS variable. D'autres projets du site parent auront peut-être leur couleur.

### 4.2 Typographie

Famille : **Suisse Int'l** (Swiss Typefaces).
- Graisses : **Medium** partout, **Black** pour les petits boutons du pager.
- Figma utilise encore « Inter » pour quelques petits textes du header compact : c'est un placeholder, utilise Suisse Int'l.
- Les fichiers web (`woff2`) et la licence web sont à fournir par Martial **[À CONFIRMER]**. Mets en place `static/fonts/` + `@font-face` (`font-display: swap`) + `preload` du Medium.
- Fallback : `"Helvetica Neue", Helvetica, Arial, sans-serif`.

| Token | Taille / interlignage / approche | Usage |
|---|---|---|
| `--type-display` | 220 / 85 % / −4 % | Chiffres des stats (4/5), titre du bloc Next (« Fail → ») |
| `--type-headline` | 100 / 100 % / −2 % | Titre-phrase de chaque page, « Rectify » et index des chapitres sur les covers |
| `--type-label` | 30 / 90 % | Libellés gris des Text rows, titres gris des Numbered rows, chips du header compact (30 px), libellé « Next chapter » |
| `--type-body` | 25 / 120 % | Textes courants |
| `--type-number` | 20 / 90 % | Numéros 01, 02… |
| `--type-small` | 15–16.5 / 90 % | « Scan Everything » du header compact, légendes |
| `--type-button` | 20 / 14 px, Black, MAJUSCULES | Numéros du pager before/after |
| (header compact) | « Rectify » 33 px | Header compact |
| (cover) | « Scan Everything 2026 » ≈ 50 px | Header cover de l'accueil (vérifier sur `551:624`) |

**Échelle fluide :** les tailles Figma sont pour 1728 px. Définis les tokens en `clamp()` proportionnels au viewport (taille_vw = px ÷ 17.28) avec des bornes min/max raisonnables, et un palier mobile (§10).

### 4.3 Grille et espacements (à 1728 px)

- **Marges latérales :** 20 px.
- **Deux colonnes :**
  - colonne gauche de **x 20 à 867** (libellés, numéros, titres) ;
  - colonne droite qui commence à **x 867**, largeur **841** (tous les textes courants, valeurs de crédits, chips du header compact, numéro du bloc Next).
  - La colonne droite démarre juste après la moitié de la page. Implémente-la avec une grille CSS : marges de 20 + `grid-template-columns: 1fr 1fr` + `column-gap: 6px` donne deux colonnes de 841 et une colonne droite exactement à x 867 à 1728 px.
- **Numbered row :** numéro en x 20 ; titre gris en **x ≈ 436** (largeur 431) ; texte en colonne droite.
- **Espacement vertical entre blocs :** **50 px**. Le bloc headline a un padding-top de 50 sous le header.
- **Filets :** 1 px noir (haut des lignes de liste, au-dessus des crédits, au-dessus du bloc Next, sous la rangée d'écrans de Test).
- **Rayons :**
  - 5 px : écrans, viewport du before/after ;
  - 3 px : chips du header compact ;
  - disques : 50 %.
- **Grilles d'images :**
  - 2 colonnes, gouttière **5 px**, padding vertical 5 px ;
  - fond `--color-gallery` (blanc) ou transparent (pages orange) ;
  - cellules **16:9** (861.5×485).
- **Écrans d'interface :** 538×958 (≈ 9:16).
- **Motion :**
  - fondu des remarques 300 ms ease-out ;
  - glissement du before/after 450 ms ease-in-out ;
  - survols 150 ms ;
  - tout est désactivé ou réduit si `prefers-reduced-motion: reduce`.

---

## 5. Architecture du site

### 5.1 Routes

```
/                          Index « Scan Everything 2026 » [À CONFIRMER : liste des projets (non maquettée) ou redirection vers /rectify]
/rectify                   Accueil du projet (cover orange)
/rectify/test              Chapitre 01
/rectify/fail              Chapitre 02
/rectify/fix               Chapitre 03
/rectify/conclusion        Chapitre 04 (cover orange)
```

- Le site est **multi-projets dès le départ** : `[project]` et `[chapter]` sont dynamiques et alimentés par un registre de projets.
- Seul Rectify existe pour l'instant. Un projet inconnu ou un chapitre inconnu doit renvoyer une 404 propre.
- `trailingSlash: 'never'`. Liens internes avec `resolve()` / `href` relatifs à la base (le site peut être servi dans un sous-dossier **[À CONFIRMER]**).

### 5.2 Arborescence proposée (à valider en phase 0)

```
frontend/src/
  app.html
  routes/
    +layout.js                 prerender = true, trailingSlash
    +layout.svelte             styles globaux (reset, fonts, tokens), lien d'évitement
    +page.svelte               index Scan Everything (ou redirect)
    +error.svelte              404 / erreurs, dans le style du site
    [project]/
      +layout.js               charge le projet (404 si inconnu) + entries()
      +page.svelte             accueil projet → <CoverPage>
      [chapter]/
        +page.js               charge le chapitre (404) + entries()
        +page.svelte           <CoverPage> ou <ChapterPage> selon chapter.layout
  lib/
    content/
      types.js                 @typedef JSDoc du modèle (§6)
      projects/index.js        registre : { rectify }
      projects/rectify.js      ← FOURNI, ne pas modifier les textes
      assets.js                résolution « nom de fichier → image optimisée » (import.meta.glob)
    components/
      layout/   CompactHeader, CoverHeader, ChapterIndex, NextChapter, Credits, SkipLink
      blocks/   BlockRenderer, Headline, TextRow, NumberedRow, Screens, Remarks, Stats,
                List, BeforeAfter, Gallery, Figure
      ui/       Picture, Mark, PagerButton, RichText
    styles/     reset.css, fonts.css, tokens.css, global.css
  lib/assets/projects/rectify/…   ← FOURNI
frontend/static/
  fonts/…                         (à fournir)
  projects/rectify/TFF-RishabThomas-Documentation.pdf   ← FOURNI
```

### 5.3 Deux gabarits de page

- **CoverPage** (accueil projet et Conclusion) :
  - fond `--color-accent` ;
  - **CoverHeader** dans le flux, non fixe ;
  - dessin isométrique ;
  - puis les blocs ;
  - puis **NextChapter**.
- **ChapterPage** (Test, Fail, Fix) :
  - fond blanc ;
  - **CompactHeader fixe en haut** (dans Figma, la frame a `numberOfFixedChildren = 1`) ;
  - le contenu commence sous le header (padding-top = hauteur du header) ;
  - puis les blocs ;
  - puis **NextChapter**.

Le choix du gabarit vient de `chapter.layout` (`'cover'` | `'chapter'`). L'accueil projet utilise toujours `cover`.

---

## 6. Modèle de contenu

Le fichier `rectify.js` est la référence. Formalise-le en JSDoc dans `content/types.js`. Résumé :

```js
/** @typedef {{ slug:string, title:string, edition:string, authors:string[], year:string,
 *   documentation:{label:string, href:string}, accent?:string,
 *   home: Page, chapters: Chapter[] }} Project */
/** @typedef {{ layout:'cover'|'chapter', theme:'orange'|'white',
 *   drawing?:{image:string, placement:'center'|'corner', alt:string},
 *   blocks: Block[], next: Next }} Page */
/** @typedef {Page & { slug:string, number:string, title:string, figma?:string }} Chapter */
/** @typedef {{ label:string, number:string, title:string, to:string, arrow?:'right'|'up' }} Next */
```

Types de blocs (`block.type` → composant) :

| `type` | Champs | Composant |
|---|---|---|
| `headline` | `text` | `Headline` (le `<h1>` de la page) |
| `textRow` | `label`, `text` (`\n\n` = paragraphe, `\n` = retour à la ligne) | `TextRow` |
| `numberedRow` | `number`, `title`, `text` | `NumberedRow` |
| `screens` | `items[] {image, alt}` | `Screens` |
| `remarks` | `image`, `alt`, `points[] {number, x, y (en % de l'écran), side:'left'\|'right', text}` | `Remarks` |
| `stats` | `label?`, `items[] {value, label, note?}` | `Stats` |
| `list` | `columns: 1\|2`, `legend?`, `items[] {number, text, tone?:'worked'\|'didnt'}` | `List` |
| `beforeAfter` | `pages[] {image, alt}` | `BeforeAfter` |
| `gallery` | `columns`, `fit:'cover'\|'contain'`, `items[] {image, alt}` | `Gallery` |
| `figure` | `image`, `alt` | `Figure` |
| `credits` | — (lit `project.authors`, `year`, `documentation`) | `Credits` |

- `image` est un chemin relatif à `src/lib/assets/projects/<slug>/`. `content/assets.js` le résout via `import.meta.glob('/src/lib/assets/projects/**/*.{png,jpg}', { eager: true, query: { enhanced: true }, import: 'default' })` (ou l'équivalent selon la solution d'images retenue). **Erreur explicite au build si une image référencée n'existe pas.**
- `BlockRenderer` reçoit `blocks` et fait un `switch` sur `type`. Un type inconnu affiche un avertissement en dev et rien en prod.
- Les champs `alt` et les libellés d'interface (« Next chapter », « Back to the start », légende « worked / didn't work ») sont **de Martial**, donc modifiables. Tout le reste est **verbatim étudiants**.

---

## 7. Inventaire des composants (planification)

Pour chaque composant : fichier, props, rendu, états, accessibilité. **Valide cette liste en phase 0** (tu peux proposer des fusions ou des découpes, avec justification).

### 7.1 Layout

**`CompactHeader`** — Figma `550:1427` (« Index / Variant3 »)
- Props :
  - `project` ;
  - `chapters` ;
  - `current` (slug).
- Rendu :
  - barre pleine largeur, **fixe en haut**, hauteur ≈ 93 px (padding 10 / 0 / 20 / 20), fond blanc **[À CONFIRMER : transparent dans Figma, mais blanc nécessaire au scroll]** ;
  - à gauche, « Scan Everything » (≈ 16.5 px), lien vers le site parent **[URL À CONFIRMER]**. 72 px plus loin, « Rectify » (≈ 33 px), lien vers `/rectify` ;
  - à partir de **x 867**, 4 **chips** Test / Fail / Fix / Conclusion :
    - fond `--color-accent`, rayon 3, padding 3 / 12 ;
    - Suisse Medium 30, texte noir ;
    - espacement 5.
- États :
  - chip de la page courante en **texte blanc** + `aria-current="page"` ;
  - survol **[À CONFIRMER]**, proposition : texte blanc.
- `<header>` + `<nav aria-label="Chapters">`.

**`CoverHeader`** — Figma `568:207` (accueil) et `550:1137` (conclusion)
- Props :
  - `project` ;
  - `current` (slug ou `null`) ;
  - `showEdition` (bool) ;
  - `drawing`.
- Rendu, sur fond orange, padding 20 :
  - ligne 1 : « Rectify » (`--type-headline`) dans la colonne gauche ; sur l'accueil, « Scan Everything 2026 » en colonne droite ;
  - plus bas, `ChapterIndex` ;
  - dessin `iso-drawing.png` :
    - accueil : centré sous l'index, ≈ 540×900 ;
    - conclusion : petit, en haut à droite, ≈ 215×355.

**`ChapterIndex`** — Figma `576:71`
- 4 liens géants (`--type-headline`), espacement 60.
- Les numéros 01–04 existent mais sont invisibles dans Figma : garde-les pour les lecteurs d'écran, ou propose de les afficher.
- États :
  - défaut : noir ;
  - survol : blanc ;
  - courant : blanc + `aria-current`.

**`NextChapter`** — Figma `567:78`
- Props : `label`, `number`, `title`, `href`, `arrow`.
- Rendu : bloc pleine largeur entièrement cliquable, filet 1 px en haut, padding 20 / 20 / 40.
  - ligne : `label` (`--type-label`, gris) en colonne gauche, `number` (idem) en colonne droite ;
  - dessous, `title` + flèche « → » (ou « ↑ ») en `--type-display`.
- États :
  - fond = fond de page par défaut, **orange au survol** ;
  - sur l'accueil (orange), Figma montre le bloc déjà orange. Proposer un survol inversé (fond blanc ou noir) **[À CONFIRMER]**.
  - Sur la conclusion, le bloc est blanc par défaut.

**`Credits`**
- Filets 1 px au-dessus (et au-dessous sur l'accueil).
- 3 lignes serrées : libellé gris (`--type-label`) / valeur (`--type-body`) en colonne droite.
  - Authors : noms joints par une virgule ;
  - Year ;
  - Documentation : **lien de téléchargement du PDF**.

**`SkipLink`** — « Skip to content », visible au focus.

### 7.2 Blocs de contenu

**`Headline`** — texte en `--type-headline`, largeur 1688, padding-top 50. C'est le **`<h1>`** de la page.

**`TextRow`** — Figma `555:41`
- Libellé (`--type-label`, gris, largeur 300) à gauche, texte (`--type-body`) en colonne droite.
- Libellé vide autorisé.
- Le texte passe par `RichText` (`\n\n` donne des `<p>`, `\n` donne un `<br>`).
- Sémantique proposée : `<section>` avec libellé en `<h2>` (style label).

**`NumberedRow`** — Figma `555:44`
- Numéro (`--type-number`, gris) en x 20, titre (`--type-label`, gris) en x ≈ 436, texte en colonne droite.
- Un groupe de lignes est précédé d'un filet (voir captures Test et Fix).

**`Screens`** (Test)
- Rangée centrée d'écrans 538×958, rayon 5, espacement 28, filet sous la rangée.

**`Remarks`** (Fail) — Figma `583:1023`, **interactif**, voir §9.
- Trois colonnes :
  - gauche, 555 px : remarques 1 et 3 ;
  - centre : écran 538×958 avec 4 disques `Mark` positionnés en % ;
  - droite, 555 px : remarques 2 et 4.
- Chaque remarque latérale = disque `Mark` 40 px + texte (`--type-body`) dessous, espacement 14, 80 entre deux remarques. Padding 40 / 20.

**`Stats`** — Figma « Likert scale » `556:105` + `Site/Stat` `555:65`
- Bande pleine largeur de 4 cellules égales (432), fond orange, filet gauche 1 px noir.
- Contenu d'une cellule : valeur en `--type-display`, libellé (`--type-body`) dessous, `note` optionnelle sous le libellé.

**`List`** — Figma `Site/List row` `555:64`, liste Fail `556:121`, liste Fix `573:4805`
- Une ligne : filet 1 px en haut, numéro (`--type-number`, gris), texte (`--type-body`).
  - `columns: 1` : texte en colonne droite ;
  - `columns: 2` : deux colonnes de 864, remplies dans l'ordre (01–08 à gauche, 09–15 à droite), numéro en colonne de 120 puis texte.
- `tone` (carré 18 px, noir = « worked », orange = « didn't ») : présent dans les données mais **masqué** dans la maquette actuelle. Prévois une prop `showTone` (défaut `false`) **[À CONFIRMER]**.
- Sémantique `<ol>`.

**`BeforeAfter`** (Fix) — Figma `579:192`, **interactif**, voir §9.
- ~~Viewport 16:9 (1688×950), rayon 5, padding 40 / 20.~~ Revu par Martial (19.11.2026) : carrousel en **boucle**, slides 16:9 aux **coins arrondis** (`--radius-slide`, 16), les slides voisines **dépassent sur les côtés** (60 + espace 20), filet 1 px pour les slides blanches ; padding vertical 40.
- Pager sous l'image (espacement 14) : boutons `01`…`06`.

**`BeforeAfterReveal`** (bloc `beforeAfterReveal`, ajouté par Martial le 19.11.2026) — fork WebGL (Three.js, chargé à la demande) du carrousel. **Un seul viewer par page** avec `pairs: [{ before, after }, …]` ; des **vignettes** sous le range changent de paire (Martial). Chaque paire passe de l'image `before` à l'image `after` : front radial depuis le milieu du bord gauche, ombrage radial dans un shader, inclinaison 3D vers le curseur ; le changement de paire utilise le même front. Cadre au **ratio de l'image before**, images jamais recadrées (contain), le tout tient dans la hauteur de l'écran. Commandes : glisser l'image, range « Before / After », clic = joue la transition, vignettes (← / →). Repli CSS (cercle) sans WebGL.

**`Gallery`**
- Grille 2 colonnes, cellules 16:9, gouttières 5.
- Fond `--color-gallery` sur pages blanches, transparent sur pages orange.
- `fit: 'contain'` pour les slides (Test), `'cover'` pour les photos.
- Lazy-loading.

**`Figure`** — grande image pleine largeur (marges 20), ratio ≈ 1688×997 (Conclusion).

### 7.3 UI

**`Picture`**
- Seul point d'entrée image : sources optimisées, `alt` obligatoire (vide si décoratif), `loading`, `fetchpriority`, `sizes`, fond placeholder, pas de CLS.

**`Mark`** — Figma `555:72`
- Disque 40 px, numéro (`--type-number`) centré.
- Variantes :
  - orange : fond accent, chiffre noir ;
  - noir : fond noir, chiffre blanc.
- Rendu comme `<button>` quand interactif.

**`PagerButton`** — Figma `579:58`
- `--type-button`, padding 6 / 10.
- États :
  - défaut : noir 35 % ;
  - survol : noir 100 % ;
  - actif : fond noir, texte blanc.

**`RichText`** — conversion sûre des `\n` (pas de `{@html}` sur du contenu brut).

---

## 8. Spécification page par page (ordre exact des blocs)

Les blocs viennent du fichier de contenu, dans cet ordre. Compare toujours avec la capture correspondante.

**Accueil `/rectify`** — `docs/figma/01-home-rectify.png`, fond orange
1. `CoverHeader` : Rectify, Scan Everything 2026, index des chapitres, aucun courant.
2. Dessin isométrique centré.
3. `TextRow` « Introduction ».
4. `Credits`.
5. `NextChapter` « Next chapter · 01 · Test → ».

**Test `/rectify/test`** — `02-test.png`, fond blanc, `CompactHeader` (Test courant)
1. `Headline`.
2. `Screens` : page album v1 et timeline v1.
3. `NumberedRow` 01–03.
4. `TextRow` sans libellé (méthode).
5. `Gallery` (7 slides, `contain`).
6. `NextChapter` « 02 · Fail → ».

**Fail `/rectify/fail`** — `03-fail.png`, fond blanc, `CompactHeader` (Fail)
1. `Headline`.
2. `Remarks`.
3. `TextRow` « Results ».
4. `TextRow` « Post-test questionnaire ».
5. `Stats` (Likert).
6. `TextRow` « Interview responses ».
7. `List` (15 notes, 2 colonnes).
8. `Gallery` (10 images).
9. `NextChapter` « 03 · Fix → ».

**Fix `/rectify/fix`** — `04-fix.png`, fond blanc, `CompactHeader` (Fix)
1. `Headline`.
2. `BeforeAfter` (6 pages).
3. `NumberedRow` 01–04.
4. `TextRow` « Iterating ».
5. `List` (9 idées, 1 colonne).
6. `NumberedRow` 05–08.
7. `Gallery` (4 photos).
8. `NextChapter` « 04 · Conclusion → ».

**Conclusion `/rectify/conclusion`** — `05-conclusion.png`, fond orange
1. `CoverHeader` (Conclusion courant, en blanc) + petit dessin en haut à droite.
2. `Headline`.
3. `Figure`.
4. `Gallery` (8 photos, fond transparent).
5. `TextRow` ×5 (Context, Principles, Hypothesis, Outcome, Process).
6. `Credits`.
7. `NextChapter` « Back to the start · Rectify ↑ » (fond blanc), lien vers `/rectify`.

---

## 9. Interactions et états

**Header compact fixe** : il reste en haut au scroll. Le contenu ne doit pas passer derrière au chargement, et les ancres doivent tenir compte de sa hauteur (`scroll-margin-top`).

**Remarques (Fail)** — reproduire le composant Figma `Fail/Remarks` (16 états, voir `11-fail-remarks-states.png`) :
- **État initial :** seuls les 4 disques **orange** sont visibles sur l'écran. Dans les colonnes latérales, les disques sont à **30 % d'opacité** et les textes **invisibles mais leur place est réservée** (opacité 0, pas de saut de mise en page).
- **Clic sur un disque** (sur l'écran **ou** dans la colonne) : bascule la remarque correspondante.
  - Ouverte : le texte apparaît en fondu (300 ms) et les deux disques deviennent **noirs**.
  - Second clic : la remarque se referme.
- Les 4 remarques sont **indépendantes**, plusieurs peuvent être ouvertes à la fois.
- Accessibilité :
  - disques en `<button aria-expanded aria-controls>`, avec un libellé (« Show remark 1 ») ;
  - texte de la remarque masqué aux lecteurs d'écran quand il est fermé ;
  - ordre de tabulation logique 1, 2, 3, 4.
- Option **[À CONFIRMER]** : un compteur « 2 / 4 » ou un bouton « Show all ».

**Before / after (Fix)** — reproduire `Site/Before-after` :
- Piste horizontale d'images. Changement de page = translation 450 ms ease-in-out. Pas d'animation si mouvement réduit.
- Pager `01`…`06` :
  - clic : va à la page ;
  - page active : style actif + `aria-current="true"`.
- Clic sur l'image : page suivante (boucle de 06 vers 01) ; clic sur la slide qui dépasse à gauche : page précédente.
- Clavier : ← / → quand le composant a le focus.
- Tactile : swipe horizontal (pointer events, sans librairie).
- Accessibilité :
  - `role="region"`, `aria-roledescription="carousel"`, `aria-label="Before and after"` ;
  - chaque slide en `aria-roledescription="slide"` avec `aria-label="1 of 6"` ;
  - annonce polie du changement ;
  - images hors écran `inert`.

**Survols** :
- chips et liens d'index : couleur ;
- `NextChapter` : fond orange ;
- `PagerButton` : opacité.

Transitions 150 ms. Tous les éléments interactifs ont un **focus visible** (contour 2 px noir, ou blanc sur fond noir).

**Transitions de page** [À CONFIRMER] : facultatif, View Transitions API via `onNavigate`, un fondu sobre, désactivé si mouvement réduit.

---

## 10. Responsive (pas de maquette mobile : propose, puis fais valider)

Il n'y a que le desktop 1728 dans Figma. Proposition à soumettre en phase 0 :

- **≥ 1280 px :** échelle fluide fidèle à la maquette (tokens en `clamp()`).
- **768–1279 px :** même structure, colonnes resserrées. Le bloc `Remarks` passe en écran centré, remarques en dessous sur 2 colonnes.
- **< 768 px :**
  - une seule colonne, les libellés passent au-dessus des textes ;
  - `Stats` en 2×2 ;
  - `Gallery` et `List` en 1 colonne ;
  - `Screens` empilés ou en défilement horizontal ;
  - header compact : « Rectify » + chips en défilement horizontal (« Scan Everything » peut passer dans un menu) ;
  - `--type-display` et `--type-headline` fortement réduits.
- Aucun débordement horizontal de la page. Zones tactiles de 44 px minimum.

---

## 11. Accessibilité (WCAG 2.1 AA visé)

- Landmarks `header` / `nav` / `main` / `footer`, `SkipLink`, un seul `h1` par page (le `Headline`), hiérarchie de titres cohérente.
- Tous les textes alternatifs sont dans le contenu ; les dessins décoratifs ont `alt=""`.
- **Contrastes à vérifier :**
  - le gris (noir 50 %) sur blanc ≈ 4 : 1 passe seulement en grand texte (≥ 24 px). C'est le cas des libellés à 30 px, à surveiller en mobile ;
  - le gris sur **orange** est trop faible : signale-le et propose une alternative (ex. noir 70 %) **[À CONFIRMER]** ;
  - le blanc sur orange (chip courant, index courant) est faible lui aussi : propose un renfort, par exemple un soulignement.
- Navigation complète au clavier, focus visible, `prefers-reduced-motion` respecté.
- Vérifie chaque page avec axe ou Lighthouse.

---

## 12. Performance et SEO

- Objectif Lighthouse **≥ 95** (Performance, Accessibilité, Best Practices, SEO) sur chaque page, en build de production.
- **Zéro CLS** : dimensions explicites sur toutes les images, polices avec `size-adjust` ou métriques de fallback, header fixe pris en compte.
- Images :
  - AVIF/WebP en plusieurs largeurs, `sizes` correct (50vw pour les grilles 2 colonnes, 100vw pour `Figure` et `BeforeAfter`, ~31vw pour les écrans) ;
  - `loading="lazy"` sous la ligne de flottaison ;
  - `fetchpriority="high"` pour la première image visible.
- Aucun gros PNG original servi en production.
- Pas de JS inutile : les composants interactifs sont légers et vanilla.
- `<title>` par page : « Fail — Rectify — Scan Everything 2026 ».
- `meta description` : la 1re phrase du headline ou de l'intro.
- Open Graph : `og:image` = `main-01` optimisée.
- Favicon simple **[À CONFIRMER]**.

---

## 13. Règles de contenu (non négociables)

- Les textes des étudiants sont **reproduits mot pour mot**, fautes comprises. Exemples volontaires :
  - « in applied » ;
  - « ideates » ;
  - « user our judgement » ;
  - « dissapearing » ;
  - « Our core principles was » ;
  - « We think allowed us » ;
  - « Single a record is sealed » ;
  - « should to right information ».
  - **Ne rien corriger, reformuler, couper ni traduire.** Les apostrophes typographiques (’ “ ”) sont voulues.
- Si un texte doit être coupé pour la mise en page, on coupe **entre deux phrases**, jamais à l'intérieur d'une phrase, et on le signale.
- Toute modification du fichier de contenu (hors `alt` et libellés d'interface) passe par Martial.

---

## 14. Points ouverts et incohérences connues (à poser en phase 0)

1. **Route `/`** : index « Scan Everything 2026 » (liste des projets, pas de maquette) ou simple redirection vers `/rectify` ?
2. **Hébergement / domaine / sous-dossier** : static OK ?
3. **Polices** : fichiers web de Suisse Int'l Medium et Black, et licence web.
4. **Header compact** :
   - fond (blanc ?) ;
   - état de survol des chips ;
   - URL du lien « Scan Everything » ;
   - y a-t-il un lien « About » (présent dans d'anciennes versions, absent aujourd'hui) ?
5. **Mobile** : valider la proposition du §10.
6. **Test** : dans Figma, les titres des lignes 01 et 02 sont inversés par rapport aux textes (« Understanding » sur le texte « Evaluating… »). Le contenu fourni les apparie correctement. À confirmer.
7. **Test** : la grille d'images de la maquette répète Test_01 / Test_02 (placeholder). Le contenu met les 7 slides.
8. **Conclusion** : dans Figma, le dernier emplacement « Fix_06 » affiche Fix_03 par erreur. Le contenu met `fix-06`.
9. **Fail** : `tone` des notes, faut-il afficher les carrés noir / orange ? Et la note 11 (« Exploring the albums… Not the mapping. ») est classée « worked » dans Figma, à vérifier.
10. **Bloc Next** sur page orange : quel état de survol ?
11. **Contraste** du gris sur orange (§11).
12. **Transitions de page** : oui ou non ?
13. **Autres projets** du site parent : une exploration existe pour « Helmetric » (Emilie Muller & Shinyoung Park) avec un autre style (page Figma `Test`). L'architecture doit permettre d'ajouter d'autres projets. Faut-il prévoir un **thème par projet** (accent, polices) ?

---

## 15. Plan de travail par phases

**Phase 0 — Audit et plan (aucun code)**
- Livrables :
  - arborescence finale ;
  - liste des composants + props + responsabilités ;
  - `types.js` en brouillon ;
  - choix techniques justifiés (adapter, images, polices, responsive) ;
  - questions du §14.
- **Stop, attendre la validation.**

**Phase 1 — Fondations**
- git ; `adapter-static` ; prerender ; `reset` / `fonts` / `tokens` ; `+layout`.
- Routing `[project]/[chapter]` + chargement des données + 404 + `entries()`.
- `content/assets.js` avec une erreur si une image manque.
- `BlockRenderer` qui affiche des placeholders par type.
- DoD : toutes les routes se prérendent, `pnpm build` OK, navigation entre pages OK.

**Phase 2 — Composants statiques et pages**
- Tous les composants du §7 sans interactions (états par défaut), les deux gabarits, les 5 pages assemblées.
- DoD : à 1728 px, chaque page correspond visuellement à sa capture (comparaison côte à côte). Textes identiques au contenu.

**Phase 3 — Interactions**
- `Remarks`, `BeforeAfter`, header fixe et état courant, survols, focus, mouvement réduit.
- DoD : tout fonctionne à la souris, au clavier et au tactile ; annonces lecteur d'écran correctes.

**Phase 4 — Responsive, accessibilité, performance**
- Paliers du §10, optimisation des images, polices, Lighthouse et axe sur chaque page.
- DoD : Lighthouse ≥ 95, aucun débordement de 320 à 2560 px, aucune violation axe critique.

**Phase 5 — Finitions**
- Meta / OG, favicon, page 404, README :
  - comment lancer le projet ;
  - comment **ajouter un projet étudiant** : fichier de contenu, dossier d'images, registre ;
  - comment déployer.
- DoD : `pnpm build && pnpm preview` OK ; le dossier `build/` est prêt à être déposé chez l'hébergeur.

---

## 16. Commandes et conventions

```bash
cd frontend
pnpm install
pnpm dev          # dev server
pnpm build        # build de production (doit toujours passer)
pnpm preview      # sert le build
```

- **Nommage** :
  - composants en `PascalCase.svelte` ;
  - utilitaires en `camelCase.js` ;
  - CSS custom properties en `--kebab-case` ;
  - slugs en minuscules.
- **Svelte 5 uniquement** : runes, snippets, `onclick` (pas de `export let`, pas de `on:`, pas de slots).
- Un composant = une responsabilité. Styles scopés. Les tokens ne sont définis que dans `tokens.css`.
- Commentaires utiles en anglais dans le code. Pas de code mort.
