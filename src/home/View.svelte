<script lang="ts">
  import { CircularProgressEstimate } from 'm3-svelte';
  import { storageClient } from '../lib/strg/index.svelte';
  import ViewText from './ViewText.svelte';

  let { path: _path }: { path: string } = $props();

  // svelte-ignore state_referenced_locally
  const path = _path; // this component must be {#key}d
  const fs = storageClient(
    (key) => `Obsidian/${key}`,
    (key) => (key.startsWith('Obsidian/') ? key.slice('Obsidian/'.length) : undefined),
  );

  // todo sync on defocus or destroy
</script>

{#if path.endsWith('.png')}
  <img src="data:image/png;base64,{btoa(fs[path])}" alt="" />
{:else if path.endsWith('.excalidraw')}
  <!-- {#await import('./ViewExcalidraw.svelte')}
    <CircularProgressEstimate
      thickness={8}
      sToHalfway={0.5}
      title="Loading Excalidraw"
      style="margin:auto"
    />
  {:then { default: ViewExcalidraw }}
    <ViewExcalidraw bind:value={fs[path]} />
  {/await} -->
{:else}
  <ViewText bind:content={() => fs[path] || '', (v) => (fs[path] = v)} />
{/if}
