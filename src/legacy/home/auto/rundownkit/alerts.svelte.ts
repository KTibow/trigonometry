import { rundownAlerts } from '../../../lib/tracked/alerts.svelte';
import { replaceRundownPart } from './_lib.svelte';

const stop = $effect.root(() => {
  $effect(() => {
    replaceRundownPart(
      (line) => line.startsWith('- **News:** '),
      rundownAlerts.current?.map((headline) => `**News:** ${headline}`) ?? [],
    );
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(stop);
}
