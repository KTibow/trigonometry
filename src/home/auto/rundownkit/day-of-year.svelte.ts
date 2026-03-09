import { today } from '../../../lib/today.svelte';
import { replaceRundownPart } from './_lib.svelte';
import { DAYS_OF_YEAR } from './_days-of-year';

const formatMonthDay = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

const stop = $effect.root(() => {
  $effect(() => {
    const currentDay = new Date(today.getTime());
    const dayOfYear = DAYS_OF_YEAR[formatMonthDay(currentDay)];

    replaceRundownPart(
      (line) => line.startsWith('- **Day:** '),
      dayOfYear ? [`**Day:** ${dayOfYear}`] : [],
    );
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(stop);
}
