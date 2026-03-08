import studentvue from 'fast-studentvue';
import { getAuthOrError, getAuthOrReauth } from './strg/common.svelte';

type StudentVueMethod = Parameters<typeof studentvue>[2];
type StudentVueParams = Parameters<typeof studentvue>[3];
type StudentVueSignal = AbortSignal | undefined;

export const iterating = <T>(value: T | T[] | undefined | null) =>
  Array.isArray(value) ? value : value == null ? [] : [value];

export const first = <T>(value: T | T[]) => (Array.isArray(value) ? value[0] : value);

export const studentvueOrError = <T>(
  methodName: StudentVueMethod,
  params?: StudentVueParams,
  signal?: StudentVueSignal,
) =>
  studentvue(
    getAuthOrError(),
    () => {
      throw new Error('Bad auth');
    },
    methodName,
    params,
    signal ? (url, args) => fetch(url, { ...args, signal }) : undefined,
  ) as Promise<T>;

export const studentvueOrRelog = <T>(
  methodName: StudentVueMethod,
  params?: StudentVueParams,
  signal?: StudentVueSignal,
) =>
  studentvue(
    getAuthOrReauth(),
    () => {
      location.hash = 'login';
      throw new Error('relogging');
    },
    methodName,
    params,
    signal ? (url, args) => fetch(url, { ...args, signal }) : undefined,
  ) as Promise<T>;
