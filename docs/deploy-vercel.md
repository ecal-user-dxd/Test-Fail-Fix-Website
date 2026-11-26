# Deploying « Scan Everything 2026 » on Vercel

The site stays a fully prerendered static site (`adapter-static`, `prerender = true`,
`trailingSlash: 'always'`). Vercel only serves the files in `frontend/build/`. No server
functions, no adapter change.

## Config in the repo

`frontend/vercel.json`:

```json
{
	"$schema": "https://openapi.vercel.sh/vercel.json",
	"framework": null,
	"installCommand": "pnpm install --frozen-lockfile",
	"buildCommand": "pnpm build",
	"outputDirectory": "build",
	"trailingSlash": true,
	"headers": [
		{
			"source": "/_app/immutable/(.*)",
			"headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
		}
	]
}
```

- `framework: null` (preset « Other ») + `outputDirectory: "build"`: Vercel serves `build/` as plain
  static files. The SvelteKit preset expects a server adapter output, which this site does not make.
- `trailingSlash: true`: `/rectify/test` gets a 308 to `/rectify/test/`, which is the URL SvelteKit
  prerendered (`rectify/test/index.html`). Files with an extension (`.pdf`, `.mp4`) are not redirected.
- `404.html` (made by `adapter({ fallback: '404.html' })`) is served by Vercel with a 404 status for
  any unknown URL, and it renders `+error.svelte`.
- The header caches the hashed JS, CSS and images for a year. Everything else (pages, PDFs, videos)
  keeps Vercel's default: cached on the CDN, revalidated by the browser.

The build log will show `Detected Vercel. Please remove adapter-static options to enable zero-config
mode`. This warning is expected: the options are kept on purpose so the same build still works on
ECAL hosting and keeps the custom 404 page.

## Vercel project settings (one time)

1. Push the repo to a **private** GitHub repository (there is no git remote yet).
2. Vercel → Add New → Project → import that repository.
3. **Root Directory: `frontend`** (vercel.json lives there and is only read from the root directory).
4. Framework Preset shows « Other » (from vercel.json). Leave the build fields as they are.
5. Settings → Build and Deployment → **Node.js Version: 24.x** (Vercel's default is now 26.x, which this
   stack has not been tested on; SvelteKit 3.2 needs ≥ 22.17).
6. Do **not** set `BASE_PATH` (it is only for sub-folder hosting at ECAL).
7. Deploy. Send people the **production domain** (`<project>.vercel.app` or a custom domain), never a
   deployment URL with a hash in it: those are behind Vercel login by default (Deployment Protection).

## Risks and fixes

| Risk | What happens | Fix |
|---|---|---|
| Untracked files not pushed | Vercel builds only what is committed. This morning `VideoClip.svelte`, `Bento.svelte` and `webgl/front.js` were untracked and `Video.svelte` deleted but not staged. Missing one = « Could not resolve import » on Vercel while it builds fine on the Mac. | Before pushing, `git status` must show nothing under `frontend/` you need. Best check: clone the repo to a temp folder and run `pnpm install && pnpm build` there. |
| Source too big for the CLI on Hobby | `frontend/` without node_modules is about 435 MB; the Hobby CLI upload limit is 100 MB (Pro 1 GB). `vercel deploy` from the Mac fails. | Deploy through the GitHub integration (Vercel builds from git, no upload limit of that kind). |
| Files over 100 MB | GitHub refuses any file over 100 MB, so the 276 MB Helmetric documentation PDF cannot be pushed; the 53 / 95 MB Draw‑Scan‑Explore PDFs and the >1 GB student videos are too heavy for visitors anyway. | Keep them off the repo: Vimeo for videos, your FTP for big PDFs, and put that URL in the `href`. Use the FTP's **https://** web address, not `ftp://` (browsers no longer open ftp links) nor `http://` (Chrome blocks insecure downloads from an https page). Largest file in `static/` today: 14 MB, fine. |
| Placeholder Vimeo links | FreshDrop, Return Shelf Machine and Lost & Found still link to `https://vimeo.com/` with `[À CONFIRMER]`. | Paste the real Vimeo URLs before 12:00. If a video is « Unlisted », use the full link with its hash. If you embed a Vimeo player later, add the Vercel domain to the video's allowed embed domains. |
| Case-sensitive paths | Mac is case-insensitive, Vercel (Linux) is not: `Foo.png` vs `foo.png` works locally and 404s online. | Checked today: all 398 tracked files match their real case, and every `/projects/…` link in the content matches a file in `static/` exactly. Re-check if files are renamed (a rename that only changes case is not seen by git on the Mac: use `git mv`). |
| pnpm version | `pnpm-workspace.yaml` has no `packages` field. pnpm 10 accepts that; pnpm 9 stops with « packages field missing or empty ». New Vercel projects use pnpm 10 for this lockfile. | If the build log says pnpm 9: add `"packageManager": "pnpm@10.15.1"` to package.json and the env var `ENABLE_EXPERIMENTAL_COREPACK=1` in Vercel. |
| Lockfile out of date | `pnpm install --frozen-lockfile` fails if someone adds a dependency without committing `pnpm-lock.yaml`. | Commit package.json and pnpm-lock.yaml together. |
| Prerender errors | Any internal link to a page that does not exist stops the build (`404 … linked from …`). | Read the error: it names the bad link and the page that has it. Fix the link; don't switch `handleHttpError` to `warn`. |
| Build time (images) | enhanced-img turns the ~290 source images into ~2,900 AVIF/WebP files (158 MB of the 212 MB output). Measured on a 4‑core Linux machine like Vercel's: **first build 21 min**, rebuild 10 s once the image cache (`node_modules/.cache/imagetools`) exists. Vercel's limit is 45 min. | Start the first deploy **by 11:00**, not at 11:50. Later deploys reuse Vercel's build cache: don't tick « Redeploy without cache ». Keep images in `src/lib/assets` (optimized), never originals in `static/`. |
| View Transitions | None in the code yet. If one is added with `onNavigate` + `document.startViewTransition`, it only runs on in-site clicks, not on first load or reload. | Feature-detect (`if (!document.startViewTransition) return`), skip under `prefers-reduced-motion`, and check the WebGL pages (reveal viewer, cover) on the deployed preview in Safari and Firefox. Nothing to set on Vercel. |
| Fonts and student files in a public repo | Suisse Intl is a commercial font, and the repo has student PDFs. | Keep the GitHub repo private. |

## What was checked (26 Nov 2026, morning snapshot of the working tree)

- Clean install with `pnpm install --frozen-lockfile` (pnpm 10.15.1) and `pnpm build` on Linux with Node 24 and `VERCEL=1`: passes, 31 pages prerendered, `404.html` written, 212 MB output.
- Served like Vercel (308 to the trailing slash, `404.html` for unknown paths): `/`, every project home and chapter answer 200, `/rectify` and `/rectify/test` redirect to the slash form, `/nope/` and `/rectify/tset/` answer 404 and show the site's 404 page, PDFs answer 200. No JavaScript errors in Chromium; clicking from the index into a project works.
- Two more builds from scratch: 22 and 21 min, peak memory about 4 GB for the whole machine. With the image cache kept: 10 s.
- Not checked: a real Vercel deploy (needs your account), and whatever lands after this snapshot. Re-run the build check after the last changes.
