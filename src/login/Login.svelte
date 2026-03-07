<script>
  import { Spring } from 'svelte/motion';
  import Noise from './Noise.svelte';

  let stillness = new Spring(1, { damping: 1, precision: 0.001 });
  let focused = $state(false);
  let email = $state('');
  let password = $state('');

  $effect(() => {
    if (focused) {
      stillness.target = 0;
    } else {
      stillness.target = 1;
    }
  });
</script>

<svelte:head>
  <title>Log in</title>
</svelte:head>
<form
  class="modalish"
  onfocusin={() => (focused = true)}
  onfocusout={() => (focused = false)}
  style:--stillness={stillness.current}
>
  {#if stillness.current < 1}
    <Noise />
  {/if}
  <input
    type="text"
    inputmode="numeric"
    pattern={'[01][0-9]{7}'}
    maxlength="7"
    placeholder="Student ID"
    bind:value={email}
    required
  />
  <!-- <input type="password" placeholder="Password" bind:value={password} required /> -->
  <!-- {#if email && password}
    <button class="primary m3-layer"> Continue </button>
  {:else if !email && !password}
    <button class="text m3-layer" formnovalidate>
      <!-- <Icon /> Skip
    </button>
  {/if}
  <p>
    Logging into Trigonometry turns on features like Rundown and schedule tracking without even
    letting Trigonometry see your password.
  </p> -->
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: auto;
    width: 10rem;
    > * {
      text-align: center;
    }
  }
  form > :global(*) {
    z-index: 1;
  }
  form:focus-within > :global(*) {
    z-index: 50;
  }
  ::placeholder {
    text-align: center;
  }
  input {
    @apply --m3-focus-none;
    height: 3rem;
    border-radius: var(--m3-shape-full);

    background-color: color-mix(
      in oklch,
      var(--m3c-surface-container-highest) calc(var(--stillness) * 100%),
      --translucent(var(--m3c-on-surface), 0.2)
    );
    &::placeholder {
      color: color-mix(
        in oklch,
        var(--m3c-on-surface-variant) calc(var(--stillness) * 100%),
        --translucent(var(--m3c-on-surface), 0.5)
      );
    }
  }
</style>
