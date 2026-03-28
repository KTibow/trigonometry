import { mount } from 'svelte';
import 'm3-svelte/etc/layer';
import './app.css';
import App from './App.svelte';
import { _loadAuth } from './lib/strg/common.svelte';

try {
  const credential = (await navigator.credentials.get({
    mediation: 'optional',
    password: true,
  } as CredentialRequestOptions & { password: true })) as {
    id: string;
    password: string;
    type: 'password';
  } | null;
  if (credential) {
    _loadAuth(credential.id, credential.password);
  }
} catch (e) {
  console.warn('while getting credential', e);
}

// import('./lib/tracked/verification.svelte');
// import('./home/auto/+main');
mount(App, {
  target: document.body!,
});
