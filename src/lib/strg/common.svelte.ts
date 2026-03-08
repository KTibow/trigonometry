import { decode, encode } from 'base36-esm';
import { storageClient } from './index.svelte';
const client = storageClient();
const authKey = '.local/login.encjson';

export type Auth = { email: string; password: string };
export const setAuth = (auth: Auth) => {
  client[authKey] = encode(JSON.stringify(auth));
};
export const getAuthOrReauth = () => {
  const value = client[authKey];
  if (!value) {
    location.hash = 'login';
    throw new Error('reauthing');
  }
  return JSON.parse(decode(value)) as Auth;
};
export const getAuthOrUndefined = () => {
  const value = client[authKey];
  if (!value) return undefined;
  return JSON.parse(decode(value)) as Auth;
};
