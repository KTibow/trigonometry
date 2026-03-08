<script lang="ts">
  import { isHotkey } from '../lib/focus';
  import { now } from '../lib/now.svelte';
  import Choose from './Choose.svelte';
  import View from './View.svelte';

  let todayPath = $derived.by(() => {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `Present/${year}-${month}-${day}.md`;
  });
  let oldTodayPath = '';
  let path = $state('');

  $effect(() => {
    if (path == oldTodayPath) {
      path = todayPath;
    }
    oldTodayPath = todayPath;
  });
</script>

<svelte:head>
  <title>Trigonometry</title>
  <style>
    :root {
      --choose-height: 2.5rem;
      @media (width >= 100rem) {
        --choose-height: 3rem;
      }
    }
  </style>
</svelte:head>
<svelte:window
  onkeydown={(e) => {
    if (isHotkey(e)) {
      document.querySelector<HTMLDivElement>('.editor')?.focus();
    }
  }}
/>

{#key path}
  <View {path} />
{/key}
<Choose {todayPath} bind:path />
