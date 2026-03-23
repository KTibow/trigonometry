import { iterating, studentvueOrRelog } from '../studentvue';
import { getAuthOrUndefined } from '../strg/common.svelte';
import { makeTracked, versionedCache } from './_lib.svelte';

type OneOrMany<T> = T | T[];
export type StudentClassList = {
  StudentClassSchedule: {
    ClassLists?: {
      ClassListing?: OneOrMany<{
        '@_Teacher': string;
      }>;
    };
    TodayScheduleInfoData?: {
      SchoolInfos?:
        | {
            SchoolInfo?: OneOrMany<{
              '@_SchoolName': string;
            }>;
          }
        | string;
    };
  };
};

export type SchoolAndTeachers = {
  school: string;
  teachers: string[];
};

export const getSchoolAndTeachers = (): SchoolAndTeachers | undefined => {
  const currentStudentClassList = studentClassList.current;

  if (!currentStudentClassList) {
    return undefined;
  }

  const {
    StudentClassSchedule: { ClassLists, TodayScheduleInfoData },
  } = currentStudentClassList;

  const school = (
    typeof TodayScheduleInfoData?.SchoolInfos == 'object'
      ? iterating(TodayScheduleInfoData.SchoolInfos.SchoolInfo)[0]
      : undefined
  )?.['@_SchoolName'];
  if (!school) {
    return undefined;
  }

  return {
    school,
    teachers: [
      ...new Set(
        iterating(ClassLists?.ClassListing).map((c) =>
          c['@_Teacher'].split(', ').reverse().join(' '),
        ),
      ),
    ],
  };
};

const [studentClassList, stop] = makeTracked<StudentClassList>({
  label: 'Checking the schedule',
  run: () => {
    const email = getAuthOrUndefined()?.email;
    if (!email) {
      return undefined;
    }

    return {
      cache: versionedCache('sv-classlist', email),
      load: (signal) => studentvueOrRelog<StudentClassList>('StudentClassList', undefined, signal),
    };
  },
});

import.meta.hot?.dispose(stop);

export { studentClassList };
