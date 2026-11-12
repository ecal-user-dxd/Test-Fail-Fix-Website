# D079 — Test, Fail, Fix (ECAL) · site « Scan Everything 2026 »

Site de documentation de projets étudiants (brief « Test, Fail, Fix », MaDXD ECAL). Premier projet : **Rectify** (Thomas Neyroud & Rishab Sachidanand). Designer / commanditaire : Martial Grin.

**Avant tout travail, lis `docs/BRIEF.md` en entier.** C'est la spécification complète :

- contexte, structure du site et routes ;
- design system ;
- modèle de contenu ;
- inventaire des composants ;
- interactions ;
- plan par phases ;
- questions ouvertes.

## Repères

- App SvelteKit : `frontend/`. Docs et captures de référence : `docs/` (`docs/figma/*.png` = maquettes 1:1 à 1728 px).
- Contenu (textes verbatim, déjà rempli) : `frontend/src/lib/content/projects/rectify.js`.
- Images : `frontend/src/lib/assets/projects/rectify/`. PDF : `frontend/static/projects/rectify/`.
- Figma : fichier `f9nqzj1fV8H70n2KBJCANh`, page `0_Flow`.

  | Page | Node |
  |---|---|
  | Accueil | `551:624` |
  | Test | `551:580` |
  | Fail | `556:40` |
  | Fix | `573:4778` |
  | Conclusion | `559:237` |

  Composants sur la page `Components` (ids dans le brief §2).

## Stack (déjà initialisée, ne pas changer sans accord)

- SvelteKit 3, Svelte 5 (**runes forcées**), Vite 8, **pnpm**.
- **JavaScript + JSDoc**, pas de TypeScript.
- Alias d'import **`#lib`** (pas `$lib`). La config SvelteKit est dans `vite.config.js`.
- Cible : build **statique** prérendu (`adapter-static`, à installer en phase 1).
- CSS vanilla + custom properties. Aucun framework CSS ni librairie UI.

```bash
cd frontend && pnpm install && pnpm dev   # pnpm build doit toujours passer
```

## Règles non négociables

1. **Textes étudiants verbatim** : ne jamais corriger, reformuler, couper au milieu d'une phrase ni traduire, même les fautes (« in applied », « dissapearing », « Our core principles was »…).
2. Ne pas inventer de contenu. S'il manque quelque chose ou qu'un point est marqué **[À CONFIRMER]**, demander à Martial.
3. **Syntaxe Svelte 5 uniquement** : `$props`, `$state`, `$derived`, snippets, `onclick`. Vérifier la doc officielle (https://svelte.dev/llms.txt) plutôt que les habitudes SvelteKit 1/2.
4. **Images** : toujours optimisées (AVIF/WebP, `srcset`, dimensions explicites). Jamais les PNG originaux en production.
5. **Accessibilité AA** : clavier, focus visible, `prefers-reduced-motion`, ARIA correct sur les composants interactifs.
6. Travailler **par phases** (brief §15). En phase 0 : plan écrit, puis attendre la validation avant de coder.
7. Petits commits clairs. Expliquer tout ajout de dépendance.
