import { districtApps } from 'school-districts';
import type { RundownPart } from '../+main.svelte';

const NSD_SUB_UUIDS: Record<string, string> = {
  'Bothell High School': 'D43268D2-8620-4D75-933A-181C5A6CAE3C',
  'Inglemoor High School': 'D756C7F1-13AA-46D6-9049-DED884923A73',
  'Innovation Lab High School': '0245B0BA-2DFA-45EF-9718-71E95DBE4A24',
  'North Creek High School': 'B05F1594-8A33-4601-AF2D-8F17046346FD',
  'Woodinville High School': '1ECEDBF3-F608-46A6-AF21-AAFD1D009073',
  'Canyon Park Middle School': '348EF711-785F-49A4-A161-408F3D50B8E6',
  'Kenmore Middle School': '9EBAF662-7D2B-4A5F-BFB9-C7398C6DF814',
  'Leota Middle School': '06AFC143-9890-4364-8AB1-C24A9C5597D1',
  'Northshore Middle School': 'F2133E61-0E45-45D3-9519-995A1132E124',
  'Skyview Middle School': 'F5B7F38B-E791-431F-8C9B-A90C7011DFFB',
  'Timbercrest Middle School': 'A9E30772-C664-4618-B998-71CB566C76D2',
  'Arrowhead Elementary': '47D0F9DB-4B79-46A9-9055-22479624D960',
  'Canyon Creek Elementary': '7C7B17E4-A390-46E5-A191-9AF1E39F9005',
  'Cottage Lake Elementary': '1DFE4F7C-8345-40B7-9C68-2BE4D1EC53A2',
  'Crystal Springs Elementary': 'DE8A322E-E6DE-4F4C-B470-9F36E7714401',
  'East Ridge Elementary': '5FD5AA72-5124-46E4-B283-30A72D68FB3C',
  'Fernwood Elementary': 'E98808A3-69C6-410D-A398-A65042BCD916',
  'Frank Love Elementary': '66386AA3-3B87-4683-A0CE-0709EBFF6DF9',
  'Hollywood Hill Elementary': 'EE48C861-16A2-47E9-A208-551E969DF346',
  'Kenmore Elementary': '2A6E2F24-7972-4C50-B1C2-823102190AD3',
  'Kokanee Elementary': 'E83A91FA-868D-4555-BC68-31EB6313AB47',
  'Maywood Hills Elementary': 'D73211BC-67A4-4A7B-AB4F-F9FFB2E94309',
  'Moorlands Elementary': '30799D74-7DE3-4C53-B5BC-37AF3A6C08E8',
  'Shelton View Elementary': '3C5185E1-245D-4246-AC79-722911C0563F',
  'Sunrise Elementary': '14E8922F-00D1-462B-B78C-8D64440FA5A1',
  'Wellington Elementary': '10565F07-8CF4-4A58-94A5-28C3D0512744',
  'Westhill Elementary': 'D59B4DF0-C671-43D5-842A-26EB3884BE18',
};

const SUBSTITUTE_LINE = /^- .+ has a sub$/;

const getSynergySchoolUUID = (domain: string, school: string) => {
  if (domain != 'apps.nsd.org') {
    throw new Error('Unknown domain');
  }

  const id = NSD_SUB_UUIDS[school];
  if (!id) {
    throw new Error('Unknown school');
  }

  return id;
};

export const substitutesRundownPart = {
  label: 'Updating substitutes',
  matchesLine: (line) => SUBSTITUTE_LINE.test(line),
  load: async ({ domain, today, schoolAndTeachers }) => {
    if (!domain || !schoolAndTeachers) {
      return [];
    }

    if ([0, 6].includes(today.getDay())) {
      return [];
    }

    const apps = districtApps[domain];
    if (!apps) {
      throw new Error('Unknown domain');
    }

    const synergy = apps.find((app) => app.app == 'Synergy');
    if (!synergy) {
      throw new Error('District does not use Synergy');
    }

    const { school, teachers } = schoolAndTeachers;
    const response = await fetch(`${synergy.base}/Service/SubLogin.asmx/LoadSubs`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        curSchoolOrgYearGU: getSynergySchoolUUID(domain, school),
        dn: '',
      }),
    });

    if (!response.ok) {
      throw new Error(`Substitutes are ${response.status}ing`);
    }

    const { d }: { d: { Name: string }[] } = await response.json();

    return d
      .map((entry) => entry.Name)
      .filter((name) => name != 'Select a substitute...')
      .map((name) => name.split(', ').reverse().join(' '))
      .filter((teacher) => teachers.includes(teacher))
      .map((teacher) => `${teacher} has a sub`);
  },
} satisfies RundownPart;
