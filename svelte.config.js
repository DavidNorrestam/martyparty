import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			strict: false, // Allow build to succeed even with dynamic routes (they won't be included in static build)
			fallback: '404.html'
		}),
		paths: {
			base: '/martyparty'
		},
		prerender: {
			entries: ['*', '/quiz', '/result'],
			handleMissingId: 'warn'
		}
	}
};

export default config;
