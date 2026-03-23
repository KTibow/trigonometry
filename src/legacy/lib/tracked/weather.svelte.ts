import { schoolApps } from 'school-districts';
import { getAuthOrUndefined } from '../strg/common.svelte';
import { getSchoolAndTeachers } from './classlist.svelte';
import { dailyCache, makeTracked } from './_lib.svelte';

const WIND_WORD = /\bwind\b/i;

type WeatherRequest = {
  domain: string;
  school: string;
};

const getSchoolForecastBase = (domain: string, school: string) => {
  const appsGroup = schoolApps[domain];
  if (!appsGroup) {
    throw new Error('Unknown domain');
  }

  const apps = appsGroup[school];
  if (!apps) {
    throw new Error('Unknown school');
  }

  const nws = apps.find((app) => app.app == 'NWS');
  if (!nws) {
    throw new Error('School does not have NWS');
  }

  return nws.base;
};

const loadWeather = async ({ domain, school }: WeatherRequest, signal: AbortSignal) => {
  const response = await fetch(`${getSchoolForecastBase(domain, school)}/forecast`, { signal });
  if (!response.ok) {
    throw new Error(`Forecast is ${response.status}ing`);
  }

  const currentPeriod = (await response.json()).properties.periods[0];
  if (!currentPeriod.isDaytime) {
    return undefined;
  }

  return currentPeriod.detailedForecast
    .split(/(?<=\.) /)
    .filter((sentence: string) => !WIND_WORD.test(sentence))
    .join(' ');
};

const [rundownWeather, stop] = makeTracked<string>({
  label: 'Updating weather',
  run: () => {
    const domain = getAuthOrUndefined()?.email.split('@')[1];
    const school = getSchoolAndTeachers()?.school;
    if (!domain || !school) {
      return undefined;
    }

    const request = { domain, school };

    return {
      cache: dailyCache('weather', `${domain}/${school}`),
      load: (signal) => loadWeather(request, signal),
    };
  },
  pollMs: 15 * 60 * 1000,
});

import.meta.hot?.dispose(stop);

export { rundownWeather };
