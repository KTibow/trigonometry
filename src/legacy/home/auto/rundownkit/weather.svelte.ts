import { rundownWeather } from '../../../lib/tracked/weather.svelte';
import { replaceRundownPart } from './_lib.svelte';

const stop = $effect.root(() => {
  $effect(() => {
    replaceRundownPart(
      (line) => line.startsWith('- **Weather:** '),
      rundownWeather.current ? [`**Weather:** ${rundownWeather.current}`] : [],
    );
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(stop);
}
