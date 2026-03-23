<script module>
  const iconExcalidraw = {
    body: `<path d="m24 19.8-2.6-3-2.6-3c-1.4.6-2.6 1.9-3.7 3 .2.2-1.8 1.2-.8 1.8q1.5 1.4 3.3 2.7l2.8 2.3c.5 0 .8-.6 1.1-.9L24 20zm-7.7-.1-1.9-1.5 1.9-1.8c-.6.7-1.9 2.1-.5 2.8zm4.1 3.1q-1.6-1.1-2.8-2.5l3 2.3zm.4.2q.1 0 0 0M.6 3.5q.3 2 1 3.8c.1 1 1.2 1.5 2 2.2.7.5 1.4 1.6 2.3 1.5q2.3-2.3 4.2-5c1-1.7-2.3-3-3.3-4C4.7 1.4 2.4 1.3.3.6c-.6.1 0 1 0 1.5Zm6-1.2c.4.3.8.7 0 .3-.4-.3-2.1-.8-.8-.5zm-5.8-1q.5 1.6.6 3.4L.6 1.3ZM.5 1c-.1-.1.5.2 0 0M23.7.8c-.5-.3.3-1-.8-.7q-3.7.7-7.3 1.7-1 .9-2 2.4A330 330 0 0 1 .3 18.9c0 .3-.5 1.2.3.7.4.2 1 1 .3.4-.6 0 .4.6.6.9l3.7 3c.9-.2 1.4-1.2 2.2-1.8q6.9-7 14.8-13 .6-1 .8-2.4a31 31 0 0 0 .7-5.9m-10.8 5 .3-.4zM7.5 21.2c.3-.3.7-.6.2-.1Zm.7-.7 3.6-3.5c1.4-1.5 3.6-3.1-3.6 3.5M15 4l-4 5.4q-4.5 5.4-9.7 10c.3-1 1.8-1.8 2.5-2.7q6.2-6 11.3-13v.1zm2.9 3.4c-1.2-.4-1-2.2 0-2.6.6-.8 2.3.5 2 1.4-.1 1-1.2 1.6-2 1.2M22 8.7l-2.3 1.8-1.6 1.3q1.9-1.6 3.6-3.3.5-.8.5-1.8c.9-.4-.2 1.8-.2 2" fill="currentColor"/>`,
    width: 24,
    height: 24,
  };
</script>

<script lang="ts">
  import { Icon, snackbar } from 'm3-svelte';
  import iconUp from '@ktibow/iconset-material-symbols/arrow-upward-rounded';
  import iconPlus from '@ktibow/iconset-material-symbols/add-2-rounded';
  import iconDoc from '@ktibow/iconset-material-symbols/article-outline-rounded';
  import iconDots from '@ktibow/iconset-material-symbols/more-horiz';
  import { fs } from './fs';
  import { getKnownName } from './dailyinfo.svelte';
  import { getTodayKey, today } from '../../lib/today.svelte';

  let { path = $bindable() }: { path: string } = $props();

  let forceInclude = $derived.by(() => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return [
      `Present/${getTodayKey()}.md`,
      `Present/${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(
        tomorrow.getDate(),
      ).padStart(2, '0')}.md`,
    ];
  });

  let paths = $derived.by(() => {
    const prefix = path == '/' ? '' : path;
    const keys = Object.keys(fs);
    const dirSet = new Set<string>();
    const files: string[] = [];

    for (const key of keys) {
      if (!key.startsWith(prefix)) continue;
      if (key.includes('/', prefix.length)) {
        dirSet.add(key);
      } else {
        files.push(key);
      }
    }
    if (path == '/') {
      dirSet.add('Pages/');
      dirSet.add('Present/');
    }
    if (path == 'Present/') {
      for (const f of forceInclude) {
        if (!files.includes(f)) {
          files.push(f);
        }
      }
    }

    const dirs = Array.from(dirSet);
    dirs.sort((a, b) => a.localeCompare(b));
    files.sort((a, b) => a.localeCompare(b));
    return [...dirs, ...files];
  });
</script>

<div class="path">
  {path}
  {#if path != '/'}
    <button onclick={() => (path = path.split('/').slice(0, -2).join('/') + '/')}>
      <Icon icon={iconUp} size={16} />
    </button>
  {/if}
  <button
    title="New drawing"
    style:margin-left="auto"
    onclick={() => {
      const title = prompt('Title');
      if (!title) return;

      path = (path == '/' ? '' : path) + title + '.excalidraw';
    }}
  >
    <Icon icon={iconExcalidraw} size={12} />
  </button>
  <button
    title="New note"
    onclick={() => {
      const title = prompt('Title');
      if (!title) return;

      path = (path == '/' ? '' : path) + title + '.md';
    }}
  >
    <Icon icon={iconPlus} size={16} />
  </button>
</div>
{#each paths as p}
  {@const name = p.split('/').at(-1)}
  {#if name}
    {@const title = getKnownName(p) || name.split('.')[0]}
    <button
      class="entry m3-layer"
      onclick={() => {
        path = p;
      }}
      oncontextmenu={(e) => {
        if (forceInclude.includes(p)) return;

        const contents = fs[p];
        delete fs[p];
        snackbar(`${name} deleted`, {
          Undo: () => {
            fs[p] = contents;
          },
        });
        e.preventDefault();
      }}
    >
      {title}
      <Icon icon={p.endsWith('.excalidraw') ? iconExcalidraw : iconDoc} size={20} />
    </button>
  {:else}
    <button
      class="entry m3-layer"
      onclick={() => {
        path = p;
      }}
    >
      {p.split('/').at(-2)}
      <Icon icon={iconDots} size={20} />
    </button>
  {/if}
{/each}

<style>
  .path {
    @apply --m3-label-large;
    display: flex;
    height: 2rem;
    align-items: center;
    color: var(--m3c-on-surface-variant);
    padding-inline-start: 0.5rem;
    button {
      display: flex;
      align-items: center;
      padding-inline: 0.25rem;
      align-self: stretch;
    }
    button:last-child {
      padding-inline-end: 0.5rem;
    }
  }
  .entry {
    display: flex;
    height: 2.5rem;
    align-items: center;
    justify-content: space-between;
    padding-inline: 0.5rem;
    border-radius: 0.5rem;
    color: var(--m3c-primary);
  }
</style>
