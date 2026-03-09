import { getTodayKey } from '../lib/today.svelte';

export const getDailyNotePath = () => `Present/${getTodayKey()}.md`;
