<script lang="ts">
  import { getTodayKey } from '../../lib/today.svelte';
  import Choose from './Choose.svelte';
  import { getKnownName } from './dailyinfo.svelte';
  import Rundown from './Rundown.svelte';
  // import Choose from './Choose.svelte';
  import View from './View.svelte';

  let dailyNotePath = $derived(`Present/${getTodayKey()}.md`);
  let oldDailyNotePath = '';
  let path = $state('');
  let fileName = $derived(path.split('/').at(-1));

  $effect(() => {
    if (path == oldDailyNotePath) {
      path = dailyNotePath;
    }
    oldDailyNotePath = dailyNotePath;
  });
</script>

<div class="today">
  {#if fileName}
    <button
      class="choose m3-layer"
      onclick={() => (path = path.split('/').slice(0, -1).join('/') + '/')}
      >{getKnownName(path) || fileName.split('.')[0]}</button
    >
    {#key path}
      <View {path} />
    {/key}
    <Rundown {path} />
  {:else}
    <Choose bind:path />
  {/if}
</div>

<style>
  .today {
    display: flex;
    flex-direction: column;
    background-color: var(--m3c-surface);
    border-radius: 0.5rem;
  }
  .choose {
    @apply --m3-label-large;
    display: flex;
    height: 2rem;
    align-items: center;
    padding-inline: 0.5rem;
    border-radius: inherit;
    color: var(--m3c-on-surface-variant);
  }
</style>
