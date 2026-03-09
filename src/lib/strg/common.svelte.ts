import { decode, encode } from 'base36-esm';
import { storageClient } from './index.svelte';

const client = storageClient();
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
const KEY_AUTH = '.local/login.encjson';

export type Auth = { email: string; password: string };

export const setAuth = (auth: Auth) => {
  client[KEY_AUTH] = encode(JSON.stringify(auth));
};
export const getAuthOrReauth = () => {
  const value = client[KEY_AUTH];
  if (!value) {
    location.hash = 'login';
    throw new Error('reauthing');
  }
  return JSON.parse(decode(value)) as Auth;
};
export const getAuthOrError = () => {
  const value = client[KEY_AUTH];
  if (!value) {
    throw new Error('auth not present');
  }
  return JSON.parse(decode(value)) as Auth;
};
export const getAuthOrUndefined = () => {
  const value = client[KEY_AUTH];
  if (!value) return undefined;
  return JSON.parse(decode(value)) as Auth;
};
