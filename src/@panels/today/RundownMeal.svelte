<script module lang="ts">
  let nextAnchorId = 0;
</script>

<script lang="ts">
  let {
    meal,
    last,
    hasImage,
  }: {
    meal: string;
    last: boolean;
    hasImage: boolean;
  } = $props();

  let preview: HTMLDivElement | null = $state(null);
  let hideTimer: ReturnType<typeof setTimeout> | null = $state(null);
  const anchorName = `--rundown-meal-${nextAnchorId++}`;

  const imageUrl = $derived(
    `https://raw.githubusercontent.com/KTibow/school-districts-data/refs/heads/main/data/%2Bimages/${encodeURIComponent(
      meal,
    )}.png`,
  );

  const clearHideTimer = () => {
    if (!hideTimer) return;
    clearTimeout(hideTimer);
    hideTimer = null;
  };

  const showPreview = () => {
    clearHideTimer();
    if (!preview) return;
    if (!preview.matches(':popover-open')) preview.showPopover();
  };

  const scheduleHide = () => {
    clearHideTimer();
    hideTimer = setTimeout(() => {
      if (preview?.matches(':popover-open')) preview.hidePopover();
    }, 50);
  };

  $effect(() => {
    return () => clearHideTimer();
  });
</script>

{#if hasImage}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <span
    class="meal meal-button"
    style:anchor-name={anchorName}
    onpointerenter={showPreview}
    onpointerleave={scheduleHide}
  >
    {meal}
  </span>{#if !last}{', '}{/if}
  <div bind:this={preview} class="preview" popover style:position-anchor={anchorName}>
    <img src={imageUrl} alt="" loading="lazy" />
  </div>
{:else}
  <span class="meal">{meal}</span>{#if !last}{', '}{/if}
{/if}

<style>
  .meal {
    overflow-wrap: anywhere;
  }

  .meal-button {
    text-decoration: underline dotted;
  }

  .preview {
    inset: auto;
    margin: 0;
    border: 0;
    border-radius: 0.75rem;
    background-color: var(--m3c-surface-container-highest);
    pointer-events: none;
  }

  .preview:popover-open {
    position: fixed;
    position-area: block-start center;
    position-try-fallbacks: flip-block, flip-inline;
  }

  .preview img {
    display: block;
    max-width: min(calc(100dvw - 1.5rem), 20rem);
    max-height: min(calc(100dvh - 1.5rem), 20rem);
  }
</style>
