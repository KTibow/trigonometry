<script lang="ts">
  import { slide } from 'svelte/transition';
  import { easeEmphasized } from 'm3-svelte';
  import { setAuth, type Auth } from './strg/common.svelte';

  const href = '/#login';

  type PasswordCredentialResult = {
    id: string;
    password: string;
    type: 'password';
  };

  const requestCredential = async (mediation: CredentialMediationRequirement) => {
    let credential: PasswordCredentialResult | null = null;
    try {
      credential = (await navigator.credentials.get({
        mediation,
        password: true,
      } as CredentialRequestOptions & { password: true })) as PasswordCredentialResult | null;
    } catch (e) {
      console.warn('while getting credential', e);
    }
    if (!credential?.id || !credential.password) return undefined;

    return { email: credential.id, password: credential.password } satisfies Auth;
  };

  const silentAuthRequest = requestCredential('silent');
  silentAuthRequest.then((auth) => {
    if (auth) setAuth(auth);
  });

  const handleClick = async (event: MouseEvent) => {
    if (event.button != 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;

    event.preventDefault();

    const auth = await requestCredential('optional');
    if (auth) {
      setAuth(auth);
      return;
    }

    location.assign(href);
  };
</script>

<a
  class="m3-layer"
  {href}
  style:margin-right="0.5rem"
  transition:slide={{ axis: 'x', easing: easeEmphasized, duration: 233 }}
  onclick={handleClick}
>
  Log in to track your day
</a>

<style>
  a {
    display: flex;
    align-items: center;
    border-radius: var(--m3-shape-full);

    padding-inline: 1rem;
    margin-right: 0.5rem;
    background-color: var(--m3c-primary);
    color: var(--m3c-on-primary);
    pointer-events: auto;
  }
</style>
