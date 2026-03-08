import { decode, encode } from 'base36-esm';
import { storageClient } from './index.svelte';

const client = storageClient();
const KEY_AUTH = '.local/login.encjson';
const KEY_VERIFICATION = '.cache/verification.jwt';

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
export const getAuthOrUndefined = () => {
  const value = client[KEY_AUTH];
  if (!value) return undefined;
  return JSON.parse(decode(value)) as Auth;
};

export const setVerification = (jwt: string) => {
  client[KEY_VERIFICATION] = jwt;
};
export const deleteVerification = () => {
  delete client[KEY_VERIFICATION];
};
export const getVerificationOrError = () => {
  const value = client[KEY_VERIFICATION];
  if (!value) {
    throw new Error('verification not present');
  }
  return value as string;
};
export const getVerificationOrUndefined = () => client[KEY_VERIFICATION] as string | undefined;
