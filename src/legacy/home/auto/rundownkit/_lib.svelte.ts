import { untrack } from 'svelte';
import { getDailyNotePath } from '../../dailynote.svelte';
import { fs } from '../../fs';

const RUNDOWN_RE = /^## Rundown\n(?:(?!## ).*\n?)*/m;

const parseRundownBlocks = (page: string) => {
  const lines = (page.match(RUNDOWN_RE)?.[0] ?? '').split('\n').slice(1).filter(Boolean);
  const blocks: string[] = [];
  let current = '';

  for (const line of lines) {
    if (line.startsWith('- ')) {
      if (current) {
        blocks.push(current);
      }
      current = line;
      continue;
    }

    current = current ? `${current}\n${line}` : line;
  }

  if (current) {
    blocks.push(current);
  }

  return blocks;
};

export const replaceRundownPart = (matchesLine: (line: string) => boolean, items: string[]) => {
  const path = getDailyNotePath();
  const page: string = untrack(() => fs[path] || '');
  const existing = parseRundownBlocks(page);
  const merged = [
    ...existing.filter((block) => !matchesLine(block.split('\n', 1)[0])),
    ...items.map((item) => `- ${item}`),
  ];
  const section = merged.length ? `## Rundown\n${merged.join('\n')}\n` : '';
  const nextPage = page.match(RUNDOWN_RE)
    ? page.replace(RUNDOWN_RE, section)
    : section + (page ? `\n${page}` : '');

  if (nextPage != page) {
    fs[path] = nextPage;
  }
};
