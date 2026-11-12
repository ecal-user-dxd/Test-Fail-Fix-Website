import adapter from '@sveltejs/adapter-static';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		// Must come before the SvelteKit plugin.
		enhancedImages(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Fully prerendered static site. `404.html` is served by static hosts for unknown URLs
			// and renders `+error.svelte` client-side.
			adapter: adapter({ fallback: '404.html' }),

			// Sub-folder hosting (ECAL): `BASE_PATH=/some/folder pnpm build`. Empty = domain root.
			// (SvelteKit validates the format: leading slash, no trailing slash.)
			paths: { base: /** @type {'' | `/${string}`} */ (process.env.BASE_PATH ?? '') }
		})
	]
});
