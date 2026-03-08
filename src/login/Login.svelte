<script lang="ts">
  import { Spring } from 'svelte/motion';
  import studentvue from 'fast-studentvue';
  import Noise from './Noise.svelte';
  import { isHotkey } from '../lib/focus';
  import { setAuth } from '../lib/strg/common.svelte';

  let stillness = new Spring(1, { damping: 1, precision: 0.001 });
  let liveliness = $state(0.5);
  let id = $state('');
  let password = $state('');

  let loginTimeout: ReturnType<typeof setTimeout> | undefined;
  let submittedEmail = '';
  let submittedPassword = '';
  let aborter = new AbortController();
  const login = async () => {
    const email = `${id}@apps.nsd.org`;

    if (email == submittedEmail && password == submittedPassword) return;
    submittedEmail = email;
    submittedPassword = password;
    aborter.abort();
    aborter = new AbortController();

    const result = await studentvue(
      { email, password },
      () => {
        throw new Error('Bad auth');
      },
      'ChildList',
      undefined,
      (url, init) => fetch(url, { ...init, signal: aborter.signal }),
    );

    setAuth({ email, password });
    try {
      const student = result.ChildList.Child;
      const nameParts = student.ChildName.split(' ');
      const name = `${nameParts[0]} ${nameParts.at(-1)}`;
      const iconURL = student.photo && `data:image/png;base64,${student.photo}`;
      navigator.credentials.store(
        // @ts-expect-error
        new PasswordCredential({
          id: email,
          password,
          name,
          iconURL,
        }),
      );
    } catch (e) {
      console.warn('while setting credential', e);
    }
    location.hash = '';
  };
</script>

<svelte:head>
  <title>Log in</title>
</svelte:head>
<svelte:window
  onkeydown={(e) => {
    if (isHotkey(e)) {
      document.querySelector('input')?.focus();
    }
  }}
/>
<form
  onfocusin={() => (stillness.target = 0)}
  onsubmit={(e) => {
    e.preventDefault();
    login();
  }}
  style:--stillness={stillness.current}
>
  {#if stillness.current < 1}
    <Noise {liveliness} />
  {/if}
  <input
    type="text"
    inputmode="numeric"
    pattern={'[12][0-9]{6}'}
    minlength="7"
    maxlength="7"
    placeholder="Student ID"
    bind:value={id}
    required
  />
  {#if id.length == 7}
    <input
      type="password"
      placeholder="Password"
      bind:value={password}
      onkeyup={() => {
        clearTimeout(loginTimeout);

        if (password.length < 8) return;
        loginTimeout = setTimeout(() => login(), 400);
      }}
      required
      {@attach (node) => node.focus()}
    />
  {/if}
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <button hidden></button>
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
    padding-inline: 0.5rem;

    background-color: color-mix(
      in oklch,
      var(--m3c-surface-container-highest) calc(var(--stillness) * 100%),
      var(--m3c-liquid)
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
