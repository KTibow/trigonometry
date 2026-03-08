import { SvelteDate } from 'svelte/reactivity';

export const now = new SvelteDate();
const updateNow = () => {
  now.setTime(Date.now());
  setTimeout(updateNow, 1000 - (Date.now() % 1000));
};
updateNow();
