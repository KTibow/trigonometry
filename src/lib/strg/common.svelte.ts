import { storageClient } from './index.svelte';

export const cache = storageClient(
  (key) => `.cache/${key}.json`,
  (key) =>
    key.startsWith('.cache/') && key.endsWith('.json')
      ? key.slice('.cache/'.length, -'.json'.length)
      : undefined,
  JSON.stringify,
  JSON.parse,
);
export const config = storageClient(
  (key) => `.config/${key}.json`,
  (key) =>
    key.startsWith('.config/') && key.endsWith('.json')
      ? key.slice('.config/'.length, -'.json'.length)
      : undefined,
  JSON.stringify,
  JSON.parse,
);

export type Auth = { email: string; password: string };

let internalAuth: Auth | undefined = $state();
export const _loadAuth = (email: string, password: string) => {
  internalAuth = { email, password };
};
export const setAuth = (
  email: string,
  password: string,
  name: string,
  iconURL: string | undefined,
) => {
  try {
    navigator.credentials.store(
      // @ts-expect-error
      new PasswordCredential({
        id: email,
        password,
        name,
        iconURL,
      }),
    );
    internalAuth = { email, password };
  } catch (e) {
    console.warn('while setting credential', e);
  }
};
export const getAuthOrUndefined = () => internalAuth;
export const getAuthOrError = () => {
  const auth = internalAuth;
  if (!auth) throw new Error('No auth');
  return auth;
};
