<script>
  import { now } from '../lib/now.svelte';
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
</svelte:head>
TODO home {path}

{#key path}
  <View {path} />
{/key}
