import { districtApps, schoolApps } from 'school-districts';
import { getAuthOrUndefined } from '../strg/common.svelte';
import { today } from '../today.svelte';
import getMealsRemote from './_meals.remote';
import { getSchoolAndTeachers } from './classlist.svelte';
import { makeTracked, versionedCache } from './_lib.svelte';

export type MonthlyMeals = Awaited<ReturnType<typeof getMealsRemote>>;

type MealsRequest = {
  domain: string;
  school: string;
  year: number;
  month: number;
};

const getSchoolMealBase = (domain: string, school: string) => {
  const appsGroup = schoolApps[domain];
  if (!appsGroup) {
    throw new Error('Unknown domain');
  }

  const apps = appsGroup[school];
  if (!apps) {
    throw new Error('Unknown school');
  }

  const meals = apps.find((app) => app.app == 'My School Menus');
  if (!meals) {
    throw new Error('School does not have My School Menus');
  }

  return meals.base;
};

const getDistrictMealBase = (domain: string) => {
  const apps = districtApps[domain];
  if (!apps) {
    throw new Error('Unknown domain');
  }

  const meals = apps.find((app) => app.app == 'My School Menus');
  if (!meals) {
    throw new Error('District does not have My School Menus');
  }

  return meals.base;
};

const loadMeals = async (request: MealsRequest, signal: AbortSignal) => {
  const { domain, school, year, month } = request;
  return await getMealsRemote(
    {
      districtBase: getDistrictMealBase(domain),
      schoolBase: getSchoolMealBase(domain, school),
      year,
      month,
    },
    { signal },
  );
};

const [monthlyMeals, stop] = makeTracked<MonthlyMeals>({
  label: 'Updating meals',
  run: () => {
    const domain = getAuthOrUndefined()?.email.split('@')[1];
    const school = getSchoolAndTeachers()?.school;
    if (!domain || !school) {
      return undefined;
    }

    const request = {
      domain,
      school,
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    };

    return {
      cache: versionedCache(
        'msm',
        `${request.domain}/${request.school}/${request.year}-${String(request.month).padStart(2, '0')}`,
      ),
      load: (signal) => loadMeals(request, signal),
    };
  },
});

import.meta.hot?.dispose(stop);

export { monthlyMeals };
