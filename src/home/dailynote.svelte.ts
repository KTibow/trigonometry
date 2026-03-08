import { now } from '../lib/now.svelte';
export const getDailyNotePath = () => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `Present/${year}-${month}-${day}.md`;
};
