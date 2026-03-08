import { getDailyNotePath } from '../dailynote.svelte';
import { fs } from '../fs';

const CHARGE_LANGUAGE =
  'Charge ' +
  (navigator.userAgent.includes('CrOS')
    ? 'Chromebook'
    : navigator.userAgent.includes('Mobi')
      ? 'phone'
      : 'laptop');
const CHARGE_UNFINISHED = `- [ ] ${CHARGE_LANGUAGE}`;
const CHARGE_FINISHED = `- [x] ${CHARGE_LANGUAGE}`;

const controller = new AbortController();

if ('getBattery' in navigator) {
  navigator.getBattery().then((battery) => {
    const handlePercent = async () => {
      const isCharged = battery.level > 0.3;

      const today = getDailyNotePath();

      // todo sync here
      let content = fs[today] || '';
      if (isCharged && content.includes(CHARGE_UNFINISHED)) {
        fs[today] = content.replace(CHARGE_UNFINISHED, CHARGE_FINISHED);
      }
      if (!isCharged && !battery.charging && !content.includes(CHARGE_UNFINISHED)) {
        if (content == '\n') {
          content = '';
        }
        if (content && !content.endsWith('\n')) {
          content += '\n';
        }
        if (!content.includes('## Tasks')) {
          content += '## Tasks\n';
        }
        content += CHARGE_UNFINISHED;
        fs[today] = content;
      }
    };

    handlePercent();
    battery.addEventListener('levelchange', handlePercent, { signal: controller.signal });
  });
}
if (import.meta.hot) {
  import.meta.hot.dispose(() => controller.abort());
}
