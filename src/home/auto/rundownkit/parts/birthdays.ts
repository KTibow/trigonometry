import birthdaysBySchool from 'virtual:birthdays';
import type { RundownPart } from '../+main.svelte';

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

    const todayFormatted = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;

    return teachers
      .filter((teacher) => schoolBirthdays[teacher] == todayFormatted)
      .map((teacher) => `Happy birthday ${teacher}`);
  },
} satisfies RundownPart;
