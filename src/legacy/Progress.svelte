<script lang="ts">
  import { fade } from 'svelte/transition';
  import { progress, type ProgressItem } from '../lib/progress.svelte';
  import { attachNoise } from '../lib/noise';

  const progressNoise = attachNoise({ chunkSize: 6, scaling: 0.05 });

  const displayDelayMs = 50;

  let current = $derived(progress.first);
  let visible = $state<ProgressItem | undefined>();

  $effect(() => {
    const item = current;

    if (!item) {
      visible = undefined;
      return;
    }

    if (visible) {
      visible = item;
      return;
    }

    const timeout = setTimeout(() => {
      if (current?.id == item.id) visible = item;
    }, displayDelayMs);

    return () => {
      clearTimeout(timeout);
    };
  });
</script>

{#if visible}
  <aside class="progress" transition:fade={{ duration: 150 }}>
    <canvas {@attach progressNoise}></canvas>
    {visible.label}
  </aside>
{/if}

<style>
  .progress {
    @apply --m3-label-large;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    height: 2rem;
    padding-inline: 0.5rem;
    border-radius: 0.5rem;

    overflow: hidden;
    white-space: nowrap;
    display: flex;
    align-items: center;
    z-index: 2;
    color: var(--m3c-on-primary-container-subtle);
  }

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
    background-color: var(--m3c-surface);
    color: var(--m3c-primary-container-subtle);
  }
</style>
