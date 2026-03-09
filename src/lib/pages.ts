import type { Component } from 'svelte';
import Home from '../home/Home.svelte';
import { trackProgress } from './progress.svelte';

export type NavEntry = [string, () => Component | Promise<Component>, string, string, string];
export type HiddenEntry = [string, () => Component | Promise<Component>];

const unwrapComponent = <T>(promise: Promise<{ default: T }>) =>
  trackProgress(
    'Loading page',
    promise.then((c) => c.default),
  );
export default [
  [
    '',
    () => Home,
    'Home',
    'Organize your day',
    'M15 2c-1 0-1.8.2-2.5.6L8.9 4.8a19 19 0 0 0-3.4 2.5c-.6.5-1.2 1-1.3 1.7-.2.6 0 1.3.4 1.7a32 32 0 0 0-.7 5.4c0 1.2-.2 2.3-.3 3.4-.1 1 .6 2 1.5 2.3a2 2 0 0 0 2-.6c.2.3.5.5 1 .5 1.8.2 3.6.1 5.5.2l2.4.1c1 0 1.9-.7 2.6-1.4.6-.5.8-1.2 1-1.9.4-1.2.6-2.5.5-3.8l.3-2.1c0-.6 0-1.3-.4-1.8.4-.7.4-1.7 0-2.4a8.4 8.4 0 0 0-1-3.4c-.7-1.1-1.6-2-2.7-2.8A3 3 0 0 0 15 2',
  ],
  [
    'ai',
    () => unwrapComponent(import('../ai/AI.svelte')),
    'AI',
    'Use fast LLMs',
    'M13 2c-1.1 0-2.1.9-2.2 2-.4 1-.3 2-.1 3 0 .6-.1 1.4-.8 1.6H8.2c-1 0-1.9 0-2.8.3l-1.3.4-.9.6c-.4.5-.7 1.3-.5 2a2.2 2.2 0 0 0 2.6 1.6c.5-.2 1 0 1.3.2 1 .3 2.2.8 2.7 1.8s1 2 .8 3c0 .8-.2 1.7.2 2.5a2 2 0 0 0 2.7.8 2 2 0 0 0 1-1.2c.6-.8.6-2 .6-3a6 6 0 0 1 1-3.4c.3-.5 1-.6 1.6-.7.5.1 1 0 1.3.2 1 .4 2.3-.2 2.7-1.3a2 2 0 0 0-.4-2.1c-1-.5-1.9-1-3-1.1-.4 0-.7-.2-1-.5a4 4 0 0 1-1.3-2.2l-.4-2.3c.2-.3 0-.8-.2-1A2.2 2.2 0 0 0 13 2',
  ],
  [
    'settings',
    () => unwrapComponent(import('../settings/Settings.svelte')),
    'Settings',
    'Tune rundown defaults',
    'M19.14 12.94c.04-.3.06-.62.06-.94s-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.62l-1.92-3.31a.5.5 0 0 0-.61-.22l-2.39.96a7 7 0 0 0-1.66-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.49.42l-.36 2.54c-.61.24-1.17.56-1.67.94l-2.39-.96a.5.5 0 0 0-.61.22L2.7 8.86a.5.5 0 0 0 .12.62l2.03 1.58c-.05.3-.08.62-.08.94s.03.64.08.94L2.82 14.52a.5.5 0 0 0-.12.62l1.92 3.31c.12.22.39.3.61.22l2.39-.96c.5.38 1.06.7 1.67.94l.36 2.54c.03.24.24.42.49.42h3.84c.25 0 .46-.18.5-.42l.36-2.54a7 7 0 0 0 1.66-.94l2.39.96c.22.08.49 0 .61-.22l1.92-3.31a.5.5 0 0 0-.12-.62l-2.02-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z',
  ],
  ['login', () => unwrapComponent(import('../login/Login.svelte'))],
  ['privacy', () => unwrapComponent(import('../privacy/Privacy.svelte'))],
] satisfies (NavEntry | HiddenEntry)[] as (NavEntry | HiddenEntry)[];
