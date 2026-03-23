import { districtNews } from 'school-districts';
import { getAuthOrUndefined } from '../strg/common.svelte';
import { dailyCache, makeTracked } from './_lib.svelte';

const loadAlerts = async (domain: string, signal: AbortSignal) => {
  const news = districtNews[domain];
  if (!news) {
    throw new Error('Unknown domain');
  }

  if (news.type != 'flashalert') {
    throw new Error('Unknown news type');
  }

  const response = await fetch(news.url, { signal });
  if (!response.ok) {
    throw new Error(`FlashAlert is ${response.status}ing`);
  }

  return (await response.text())
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((item) => item.org == news.org)
    .map((item) => item.headline);
};

const [rundownAlerts, stop] = makeTracked<string[]>({
  label: 'Updating alerts',
  run: () => {
    const domain = getAuthOrUndefined()?.email.split('@')[1];
    if (!domain) {
      return undefined;
    }

    return {
      cache: dailyCache('alerts', domain),
      load: (signal) => loadAlerts(domain, signal),
    };
  },
  pollMs: 15 * 60 * 1000,
});

import.meta.hot?.dispose(stop);

export { rundownAlerts };
