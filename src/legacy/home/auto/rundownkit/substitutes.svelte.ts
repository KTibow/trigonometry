import { getSchoolAndTeachers } from '../../../lib/tracked/classlist.svelte';
import { rundownSubstitutes } from '../../../lib/tracked/substitutes.svelte';
import { replaceRundownPart } from './_lib.svelte';

const stop = $effect.root(() => {
  $effect(() => {
    const teachers = getSchoolAndTeachers()?.teachers;
    const substitutes = rundownSubstitutes.current;

    replaceRundownPart(
      (line) => /^- .+ has a sub$/.test(line),
      teachers && substitutes
        ? substitutes
            .filter((teacher) => teachers.includes(teacher))
            .map((teacher) => `${teacher} has a sub`)
        : [],
    );
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(stop);
}
