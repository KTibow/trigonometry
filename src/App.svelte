<script lang="ts">
  import { Snackbar } from 'm3-svelte';
  import Today from './@panels/today/Today.svelte';
  import Progress from './Progress.svelte';
  import Now from './@panels/now/Now.svelte';
  import { getAuthOrUndefined } from './lib/strg/common.svelte';
</script>

<svelte:head>
  <title>Trigonometry</title>
</svelte:head>

<Today />
{#if getAuthOrUndefined()}
  <Now />
{:else}
  TODO
{/if}
<div class="agent">Agent</div>
<Snackbar />
<Progress />

<style>
  .agent {
    display: grid;
    place-items: center;
    background-color: var(--m3c-surface);
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
  .agent {
    grid-column: 2;
    grid-row: 1 / span 2;
  }
</style>
