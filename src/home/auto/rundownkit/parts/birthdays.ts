import birthdaysBySchool from 'virtual:birthdays';
import type { RundownPart } from '../+main.svelte';

const formatBirthday = (date: Date) =>
  `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;

export const birthdaysRundownPart = {
  label: 'Updating birthdays',
  matchesLine: (line) => line.startsWith('- Happy birthday '),
  load: async ({ today, schoolAndTeachers }) => {
    if (!schoolAndTeachers) {
      return [];
    }

    const { school, teachers } = schoolAndTeachers;
    const schoolBirthdays = birthdaysBySchool[school];
    if (!schoolBirthdays) {
      throw new Error('Unknown school');
    }

    const birthdaysToShow = [today];
    if (today.getDay() == 5) {
      birthdaysToShow.push(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      );
    }

    const todayish = new Set(birthdaysToShow.map(formatBirthday));
    const teachersToCheck = Array.from(new Set([...teachers, 'Kurt Criscione']));

    return teachersToCheck
      .filter((teacher) => todayish.has(schoolBirthdays[teacher]))
      .map((teacher) => `Happy birthday ${teacher}`);
  },
} satisfies RundownPart;
