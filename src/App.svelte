<script>
  import Nav from './lib/Nav.svelte';
  import page from './lib/page.svelte';
  import pages from './lib/pages';
  let componentPromise = $derived(
    pages.find((p) => p[0] == page.page)?.[1]() ||
      import('./Placeholder.svelte').then((c) => c.default),
  );
</script>

{#await componentPromise then Component}
  <Component />
{/await}
<Nav />
