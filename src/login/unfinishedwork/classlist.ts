export const STUDENT_CLASS_LIST_CACHE_KEY = 'sv-classlist';

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
