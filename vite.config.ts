import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { functionsMixins } from 'vite-plugin-functions-mixins';
import { monoserve } from 'monoserve/plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    functionsMixins({ deps: ['m3-svelte'] }),
    monoserve({
      monoserverURL: 'https://aw1nlzkxmd.fly.dev',
    }),
  ],
});
