import { schoolApps } from 'school-districts';
import type { RundownPart } from '../+main.svelte';

const WIND_WORD = /\bwind\b/i;

export const weatherRundownPart = {
  label: 'Updating weather',
  matchesLine: (line) => line.startsWith('- Weather: '),
  load: async ({ domain, schoolAndTeachers }) => {
    if (!domain || !schoolAndTeachers) {
      return [];
    }

    const appsGroup = schoolApps[domain];
    if (!appsGroup) {
      throw new Error('Unknown domain');
    }

    const { school } = schoolAndTeachers;
    const apps = appsGroup[school];
    if (!apps) {
      throw new Error('Unknown school');
    }

    const nws = apps.find((app) => app.app == 'NWS');
    if (!nws) {
      throw new Error('School does not have NWS');
    }

    const response = await fetch(`${nws.base}/forecast`);
    if (!response.ok) {
      throw new Error(`Forecast is ${response.status}ing`);
    }

    const forecastData = await response.json();
    const today = forecastData.properties.periods[0];

    if (!today.isDaytime) {
      return [];
    }

    const forecast = today.detailedForecast
      .split(/(?<=\.) /)
      .filter((sentence: string) => !WIND_WORD.test(sentence))
      .join(' ');

    return [`Weather: ${forecast}`];
  },
} satisfies RundownPart;
