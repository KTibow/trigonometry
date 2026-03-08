<script lang="ts">
  import type { Component } from 'svelte';
  import Progress from './Progress.svelte';
  import Nav from './lib/Nav.svelte';
  import page from './lib/page.svelte';
  import pages from './lib/pages';

  let Page: Component = $state(pages[0][1]() as Component);
  $effect(() => {
    const pageData = pages.find((entry) => entry[0] == page.page);
    if (pageData) {
      const pagePromise = pageData[1]();
      if (pagePromise instanceof Promise) {
        pagePromise.then((p) => (Page = p));
      } else {
        Page = pagePromise;
      }
    } else {
      import('./Placeholder.svelte').then((module) => (Page = module.default));
    }
  });
  
</script>

<Page />
<Progress />
<Nav />
