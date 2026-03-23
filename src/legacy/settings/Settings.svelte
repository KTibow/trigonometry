<script lang="ts">
  import { Switch } from 'm3-svelte';
  import { config } from '../lib/strg/common.svelte';
</script>

<svelte:head>
  <title>Settings</title>
</svelte:head>

<main>
  <label class="setting">
    <strong>Hide breakfast</strong>
    <Switch
      bind:checked={
        () => Boolean(config['rundown/disable-breakfast']),
        (checked) => {
          if (checked) {
            config['rundown/disable-breakfast'] = true;
            return;
          }
          delete config['rundown/disable-breakfast'];
        }
      }
    />
    <p>Skip breakfast when new rundown updates run.</p>
  </label>

  <label class="setting">
    <strong>Hide lunch</strong>
    <Switch
      bind:checked={
        () => Boolean(config['rundown/disable-lunch']),
        (checked) => {
          if (checked) {
            config['rundown/disable-lunch'] = true;
            return;
          }
          delete config['rundown/disable-lunch'];
        }
      }
    />
    <p>Skip lunch when new rundown updates run.</p>
  </label>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    max-width: 50rem;
    align-self: center;
    padding-inline: 0.5rem;
    margin-block: auto;
  }

  .setting {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.125rem 1rem;
    padding: 1rem;
    border-radius: 1.25rem;
    outline: 1px solid var(--m3c-outline-variant);
  }

  .setting > strong {
    color: var(--m3c-on-surface);
  }

  .setting > p {
    margin: 0;
    color: var(--m3c-on-surface-variant);
  }

  .setting > :global(.m3-container) {
    grid-column: 2;
    grid-row: 1 / 3;
    align-self: center;
  }
</style>
