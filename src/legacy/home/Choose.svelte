<script module>
  const iconExcalidraw = {
    body: `<path d="m24 19.8-2.6-3-2.6-3c-1.4.6-2.6 1.9-3.7 3 .2.2-1.8 1.2-.8 1.8q1.5 1.4 3.3 2.7l2.8 2.3c.5 0 .8-.6 1.1-.9L24 20zm-7.7-.1-1.9-1.5 1.9-1.8c-.6.7-1.9 2.1-.5 2.8zm4.1 3.1q-1.6-1.1-2.8-2.5l3 2.3zm.4.2q.1 0 0 0M.6 3.5q.3 2 1 3.8c.1 1 1.2 1.5 2 2.2.7.5 1.4 1.6 2.3 1.5q2.3-2.3 4.2-5c1-1.7-2.3-3-3.3-4C4.7 1.4 2.4 1.3.3.6c-.6.1 0 1 0 1.5Zm6-1.2c.4.3.8.7 0 .3-.4-.3-2.1-.8-.8-.5zm-5.8-1q.5 1.6.6 3.4L.6 1.3ZM.5 1c-.1-.1.5.2 0 0M23.7.8c-.5-.3.3-1-.8-.7q-3.7.7-7.3 1.7-1 .9-2 2.4A330 330 0 0 1 .3 18.9c0 .3-.5 1.2.3.7.4.2 1 1 .3.4-.6 0 .4.6.6.9l3.7 3c.9-.2 1.4-1.2 2.2-1.8q6.9-7 14.8-13 .6-1 .8-2.4a31 31 0 0 0 .7-5.9m-10.8 5 .3-.4zM7.5 21.2c.3-.3.7-.6.2-.1Zm.7-.7 3.6-3.5c1.4-1.5 3.6-3.1-3.6 3.5M15 4l-4 5.4q-4.5 5.4-9.7 10c.3-1 1.8-1.8 2.5-2.7q6.2-6 11.3-13v.1zm2.9 3.4c-1.2-.4-1-2.2 0-2.6.6-.8 2.3.5 2 1.4-.1 1-1.2 1.6-2 1.2M22 8.7l-2.3 1.8-1.6 1.3q1.9-1.6 3.6-3.3.5-.8.5-1.8c.9-.4-.2 1.8-.2 2" fill="currentColor"/>`,
    width: 24,
    height: 24,
  };
</script>

<script lang="ts">
  import { Icon, snackbar } from 'm3-svelte';
  import iconDoc from '@ktibow/iconset-material-symbols/article-rounded';
  import iconUp from '@ktibow/iconset-material-symbols/arrow-upward-rounded';
  import iconPlusRectangle from '@ktibow/iconset-material-symbols/rectangle-add-outline-rounded';
  import iconPlus from '@ktibow/iconset-material-symbols/add-2-rounded';
  import iconDots from '@ktibow/iconset-material-symbols/more-horiz';
  import { fs } from './fs';

  let { todayPath, path = $bindable() }: { todayPath: string; path: string } = $props();

  let dir = $state('Present/');
  let files = $derived.by(() => {
    const prefix = dir == '/' ? '' : dir;
    const keys = Object.keys(fs);
    const dirSet = new Set<string>();
    const files: string[] = [];

    for (const key of keys) {
      if (!key.startsWith(prefix)) continue;
      const rest = key.slice(prefix.length);
      if (!rest) continue;
      const slash = rest.indexOf('/');
      if (slash != -1) {
        const dirPath = prefix + rest.slice(0, slash + 1);
        dirSet.add(dirPath);
      } else {
        files.push(prefix + rest);
      }
    }
    if (dir == '/') {
      dirSet.add('Pages/');
      dirSet.add('Present/');
    }

    const dirs = Array.from(dirSet);
    dirs.sort((a, b) => a.localeCompare(b));
    files.sort((a, b) => a.localeCompare(b));
    return [...dirs, ...files];
  });

  const getKnownName = (path: string) => {
    if (path == todayPath) return "Today's daily note";
  };
</script>

<button class="m3-layer path" popovertarget="choose" popovertargetaction="show"
  >{getKnownName(path) || path.split('/').at(-1)!.split('.')[0]}</button
>
<div id="choose" popover>
  <div class="files">
    {#each files as f}
      {#if f.endsWith('/')}
        <button
          class="m3-layer"
          onclick={() => {
            dir = f;
          }}
        >
          {f.split('/').at(-2)}
          <Icon icon={iconDots} size={20} />
        </button>
      {:else}
        {@const name = getKnownName(f) || f.split('/').at(-1)!.split('.')[0]}
        <button
          class="m3-layer"
          inert={path == f}
          onclick={(e) => {
            path = f;
            e.currentTarget.closest<HTMLDivElement>('[popover]')!.hidePopover();
          }}
          oncontextmenu={(e) => {
            e.preventDefault();
            const contents = fs[f];
            delete fs[f];
            snackbar(`${name} deleted`, {
              Undo: () => {
                fs[f] = contents;
              },
            });
          }}
        >
          {name}
          <Icon icon={f.endsWith('.excalidraw') ? iconExcalidraw : iconDoc} size={20} />
        </button>
      {/if}
    {/each}
  </div>
  <span class="control" style:grid-column="1">{dir}</span>
  {#if dir != '/'}
    <button
      class="m3-layer control"
      title="View parent folder"
      style:grid-column="2"
      onclick={() => (dir = dir.split('/').slice(0, -2).join('/') + '/')}
    >
      <Icon icon={iconUp} size={20} />
    </button>
  {/if}
  <button
    class="m3-layer control"
    title="New drawing"
    style:grid-column="4"
    onclick={() => {
      const title = prompt('Title');
      if (!title) return;

      path = (dir == '/' ? '' : dir) + title + '.excalidraw';
    }}
  >
    <Icon icon={iconPlusRectangle} size={20} />
  </button>
  <button
    class="m3-layer control"
    title="New note"
    style:grid-column="5"
    onclick={() => {
      const title = prompt('Title');
      if (!title) return;

      path = (dir == '/' ? '' : dir) + title + '.md';
    }}
  >
    <Icon icon={iconPlus} size={20} />
  </button>
</div>

<style>
  .path {
    @apply --m3-label-large;

    display: flex;
    align-items: center;
    height: var(--choose-height);
    padding-inline: 1rem;
    @media (width >= 100rem) {
      @apply --m3-title-medium;
      padding-inline: 1.5rem;
    }
    border-radius: var(--m3-shape-full);
    background-color: var(--m3c-liquid);

    position: fixed;
    top: 0.5rem;
    left: 50%;
    translate: -50% 0;
    transition: var(--m3-easing);

    &:not(:hover, :focus-visible) {
      opacity: 0.8;
    }
  }

  #choose {
    height: fit-content;
    transition: var(--m3-easing);

    min-width: 15rem;
    inset: 0.5rem 0 0 50%;
    translate: -50% 0;
    overflow: hidden;
    grid-template-columns: auto auto 1fr auto auto;

    background-color: var(--m3c-surface-container-highest);
    padding: 0.5rem;
    border-radius: 1rem;
    gap: 0.5rem 0.25rem;
    pointer-events: none;

    > * {
      background-color: var(--m3c-surface-container-low);
      border-radius: 0.5rem;
      pointer-events: auto;
    }

    &:popover-open {
      display: grid;
      @starting-style {
        height: 0;
        opacity: 0;
      }
    }
  }

  .files {
    display: flex;
    flex-direction: column;
    grid-column: 1 / -1;
    &:empty {
      display: none;
    }
    > * {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 2.5rem;
      gap: 2rem;
      padding-inline: 0.625rem;
      border-radius: 0.5rem;
      &[inert] {
        background-color: var(--m3c-primary-container);
        color: var(--m3c-on-primary-container);
      }
    }
  }
  .control {
    display: flex;
    align-items: center;
    height: 2.5rem;
    padding-inline: 0.625rem;
  }
</style>
