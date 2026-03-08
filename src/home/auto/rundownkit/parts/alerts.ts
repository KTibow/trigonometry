import { districtNews } from 'school-districts';
import type { RundownPart } from '../+main.svelte';

export const alertsRundownPart = {
  label: 'Updating alerts',
  matchesLine: (line) => line.startsWith('- District: '),
  load: async ({ domain }) => {
    if (!domain) {
      return [];
    }

    const news = districtNews[domain];
    if (!news) {
      throw new Error('Unknown domain');
    }

    if (news.type != 'flashalert') {
      throw new Error('Unknown news type');
    }

    const response = await fetch(news.url);
    if (!response.ok) {
      throw new Error(`FlashAlert is ${response.status}ing`);
    }

    const lines = (await response.text())
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .filter((item) => item.org == news.org);

    return lines.map((line) => `District: ${line.headline}`);
  },
} satisfies RundownPart;
