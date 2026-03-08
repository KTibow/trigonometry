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
  ['login', () => unwrapComponent(import('../login/Login.svelte'))],
  ['privacy', () => unwrapComponent(import('../privacy/Privacy.svelte'))],
] satisfies (NavEntry | HiddenEntry)[] as (NavEntry | HiddenEntry)[];
