import { get } from 'svelte/store';
import { getAuthOrUndefined } from '../strg/common.svelte';
import { trackCached } from './_lib';

export type Meal = {
  category: string;
  days: string[];
};
export type SchoolMeals = Record<string, Record<string, Meal>>;
export type SchoolData = {
  weather: Record<string, string>;
  meals: SchoolMeals;
  subs: string[];
};

const loadSchoolData = async ({ domain, school }: { domain: string; school: string }) => {
  const response = await fetch(
    `https://raw.githubusercontent.com/KTibow/school-districts-data/refs/heads/main/data/schools/${encodeURIComponent(domain)}/${encodeURIComponent(
      school,
    )}.json`,
  );
  if (!response.ok) {
    throw new Error(`School districts data is ${response.status}ing`);
  }

  return (await response.json()) as SchoolData;
};

const getCurrentSchool = () => {
  let domain = 'apps.nsd.org';
  let school = 'Woodinville High School';

  const auth = getAuthOrUndefined();
  if (auth) {
    domain = auth.email.split('@')[1];
    // TODO: replace this with the real school selection source.
  } else {
    console.warn('Assuming', domain, school);
  }

  return { domain, school };
};

export const schoolData = trackCached(
  () => {
    const { domain, school } = getCurrentSchool();

    return {
      id: 'schoolData',
      version: `${domain}/${school}`,
      label: 'Updating school data',
      run: () => loadSchoolData({ domain, school }),
    };
  },
  { expireAfter: 15 * 60 * 1000 },
);

const refreshSchoolData = () => get(schoolData).run();
refreshSchoolData();
const stop = setInterval(refreshSchoolData, 15 * 60 * 1000);

import.meta.hot?.dispose(() => clearInterval(stop));
