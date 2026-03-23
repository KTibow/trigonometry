import { get } from 'svelte/store';
import { getAuthOrUndefined } from '../strg/common.svelte';
import { trackCached } from './_lib';

export type DistrictData = {
  alerts: string[];
};

const loadDistrictData = async (domain: string) => {
  const response = await fetch(
    `https://raw.githubusercontent.com/KTibow/school-districts-data/refs/heads/main/data/districts/${encodeURIComponent(domain)}.json`,
  );
  if (!response.ok) {
    throw new Error(`School districts data is ${response.status}ing`);
  }

  return (await response.json()) as DistrictData;
};

const getCurrentDistrict = () => {
  let domain = 'apps.nsd.org';

  const auth = getAuthOrUndefined();
  if (auth) {
    domain = auth.email.split('@')[1];
  } else {
    console.warn('Assuming', domain);
  }
  return domain;
};

export const districtData = trackCached(
  () => {
    const domain = getCurrentDistrict();

    return {
      id: 'districtData',
      version: domain,
      label: 'Updating district data',
      run: () => loadDistrictData(domain),
    };
  },
  { expireAfter: 15 * 60 * 1000 },
);

const refreshDistrictData = () => get(districtData).run();
refreshDistrictData();
const stop = setInterval(refreshDistrictData, 15 * 60 * 1000);

import.meta.hot?.dispose(() => clearInterval(stop));
