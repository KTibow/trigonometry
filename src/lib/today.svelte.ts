import { SvelteDate } from 'svelte/reactivity';

export const today = new SvelteDate();

const updateToday = () => {
  const current = new Date();
  today.setTime(current.getTime());

  const next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
  setTimeout(updateToday, next.getTime() - current.getTime());
};
updateToday();

export const getTodayKey = () =>
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`;
