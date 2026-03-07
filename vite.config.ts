import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { functionsMixins } from 'vite-plugin-functions-mixins';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), functionsMixins({ deps: ['m3-svelte'] })],
});
