<script lang="ts">
  import { isHotkey } from '../lib/focus';
  import Choose from './Choose.svelte';
  import { getDailyNotePath } from './dailynote.svelte';
  import View from './View.svelte';

  let dailyNotePath = $derived(getDailyNotePath());
  let oldDailyNotePath = '';
  let path = $state('');

  $effect(() => {
    if (path == oldDailyNotePath) {
      path = dailyNotePath;
    }
    oldDailyNotePath = dailyNotePath;
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
<Choose todayPath={dailyNotePath} bind:path />
