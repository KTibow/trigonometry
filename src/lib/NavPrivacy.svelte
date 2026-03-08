<script>
  import { easeEmphasized } from 'm3-svelte';
  import { slide } from 'svelte/transition';
</script>

<a
  class="m3-layer"
  href="/#privacy"
  style:margin-right="0.5rem"
  transition:slide={{ axis: 'x', easing: easeEmphasized, duration: 233 }}
>
  Unsure? We never see your password
</a>

<style>
  a {
    display: flex;
    align-items: center;
    border-radius: var(--m3-shape-full);

    padding-inline: 1rem;
    margin-right: 0.5rem;
    background-color: var(--m3c-primary-container-subtle);
    color: var(--m3c-on-primary-container-subtle);
    pointer-events: auto;
  }
</style>
