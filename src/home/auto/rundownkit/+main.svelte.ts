import { getAbortSignal } from 'svelte';
import { trackProgress } from '../../../lib/progress.svelte';
import { cache, getAuthOrUndefined, type Auth } from '../../../lib/strg/common.svelte';
import { iterating } from '../../../lib/studentvue';
import { getDailyNotePath } from '../../dailynote.svelte';
import { fs } from '../../fs';
import { alertsRundownPart } from './parts/alerts';
import { birthdaysRundownPart } from './parts/birthdays';
import { substitutesRundownPart } from './parts/substitutes';
import { weatherRundownPart } from './parts/weather';
import {
  type StudentClassList,
  STUDENT_CLASS_LIST_CACHE_KEY,
} from '../../../login/unfinishedwork/classlist';

const RUNDOWN_INTERVAL_MS = 15 * 60 * 1000;

const rundownParts = [
  alertsRundownPart,
  weatherRundownPart,
  birthdaysRundownPart,
  substitutesRundownPart,
];

export type RundownPart = {
  label: string;
  load: (context: RundownContext) => Promise<string[]>;
  matchesLine: (line: string) => boolean;
};

type RundownContext = {
  domain: string | undefined;
  today: Date;
  schoolAndTeachers: { school: string; teachers: string[] } | undefined;
};

const createRundownContext = (
  auth: Auth | undefined,
  studentClassList: StudentClassList | undefined,
  today = new Date(),
): RundownContext => {
  const domain = auth?.email.split('@')[1];
  if (!studentClassList) return { domain, today, schoolAndTeachers: undefined };

  const {
    StudentClassSchedule: { ClassLists, TodayScheduleInfoData },
  } = studentClassList;
  const teachers = [
    ...new Set(
      iterating(ClassLists?.ClassListing).map((c) =>
        c['@_Teacher'].split(', ').reverse().join(' '),
      ),
    ),
  ];
  const school = (
    typeof TodayScheduleInfoData?.SchoolInfos == 'object'
      ? iterating(TodayScheduleInfoData.SchoolInfos.SchoolInfo)[0]
      : undefined
  )?.['@_SchoolName'];

  return { domain, today, schoolAndTeachers: school ? { school, teachers } : undefined };
};

const RUNDOWN_RE = /^## Rundown\n(?:(?!## ).*\n?)*/m;

const stop = $effect.root(() => {
  $effect(() => {
    const auth = getAuthOrUndefined();
    const studentClassList = cache[STUDENT_CLASS_LIST_CACHE_KEY] as StudentClassList | undefined;
    const signal = getAbortSignal();

    const runPart = async (part: RundownPart) => {
      if (signal.aborted) return;
      let items: string[];
      try {
        items = await part.load(createRundownContext(auth, studentClassList));
      } catch (error) {
        console.error('[rundown]', error);
        items = [];
      }
      if (signal.aborted) return;

      const page: string = fs[getDailyNotePath()] || '';
      const existing = (page.match(RUNDOWN_RE)?.[0] ?? '').split('\n').slice(1).filter(Boolean);
      const merged = [
        ...existing.filter((l) => !part.matchesLine(l)),
        ...items.map((i) => `- ${i}`),
      ];
      const section = merged.length ? `## Rundown\n${merged.join('\n')}\n` : '';
      fs[getDailyNotePath()] = page.match(RUNDOWN_RE)
        ? page.replace(RUNDOWN_RE, section)
        : section + (page ? '\n' + page : '');
    };

    for (const part of rundownParts) {
      trackProgress(part.label, runPart(part));
      const interval = setInterval(
        () => trackProgress(part.label, runPart(part)),
        RUNDOWN_INTERVAL_MS,
      );
      signal.addEventListener('abort', () => clearInterval(interval), { once: true });
    }
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(stop);
}
