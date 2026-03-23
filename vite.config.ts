import { defineConfig, loadEnv, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { functionsMixins } from 'vite-plugin-functions-mixins';
import { monoserve } from 'monoserve/plugin';

type BirthdaysBySchool = Record<string, Record<string, string>>;

const birthdaysModuleId = 'virtual:birthdays';
const resolvedBirthdaysModuleId = `\0${birthdaysModuleId}`;

const birthdaysPlugin = (): Plugin => {
  let birthdays: BirthdaysBySchool = {};

  return {
    name: 'birthdays',
    configResolved(config) {
      const env = loadEnv(config.mode, config.envDir, '');
      const json = env.BIRTHDAYS;
      if (!json) {
        console.warn('Birthdays not loaded');
        return;
      }
      birthdays = JSON.parse(env.BIRTHDAYS);
    },
    resolveId(id) {
      if (id == birthdaysModuleId) {
        return resolvedBirthdaysModuleId;
      }

      return undefined;
    },
    load(id) {
      if (id == resolvedBirthdaysModuleId) {
        return `export default ${JSON.stringify(birthdays)};`;
      }

      return undefined;
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    birthdaysPlugin(),
    functionsMixins({ deps: ['m3-svelte'] }),
    monoserve({
      monoserverURL: 'https://aw1nlzkxmd.fly.dev',
    }),
  ],
});
