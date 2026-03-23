import birthdaysBySchool from 'virtual:birthdays';
import {
  getSchoolAndTeachers,
  type SchoolAndTeachers,
} from '../../../lib/tracked/classlist.svelte';
import { today } from '../../../lib/today.svelte';
import { replaceRundownPart } from './_lib.svelte';

const formatBirthday = (date: Date) =>
  `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;

const stop = $effect.root(() => {
  $effect(() => {
    const currentDay = new Date(today.getTime());

    const schoolAndTeachers = getSchoolAndTeachers();
    let birthdayLines: string[] = [];

    if (schoolAndTeachers) {
      const { school, teachers } = schoolAndTeachers;
      const schoolBirthdays = birthdaysBySchool[school];
      if (schoolBirthdays) {
        const birthdaysToShow = [currentDay];
        if (currentDay.getDay() == 5) {
          birthdaysToShow.push(
            new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() + 1),
            new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() + 2),
          );
        }

        const todayish = new Set(birthdaysToShow.map(formatBirthday));
        const teachersToCheck = Array.from(new Set([...teachers, 'Kurt Criscione']));

        birthdayLines = teachersToCheck
          .filter((teacher) => todayish.has(schoolBirthdays[teacher]))
          .map((teacher) => `Happy birthday ${teacher}`);
      }
    }

    replaceRundownPart((line) => line.startsWith('- Happy birthday '), birthdayLines);
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(stop);
}
