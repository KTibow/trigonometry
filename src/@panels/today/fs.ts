import { storageClient } from '../../lib/strg/index.svelte';

export const fs = storageClient(
  (key) => `Obsidian/${key}`,
  (key) => (key.startsWith('Obsidian/') ? key.slice('Obsidian/'.length) : undefined),
);
