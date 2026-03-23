import { writable } from 'svelte/store';
import { storageClient } from '../strg/index.svelte';
import { trackProgress } from '../progress.svelte';

type TrackFactory<T> = () => {
  id: string;
  version: string;
  label: string;
  run: () => Promise<T>;
};

type TrackOptions = {
  initialStale?: boolean;
  expireAfter?: number;
};

type CachedEntry<T> = { version: string; data: T };

const track = <T>(
  factory: TrackFactory<T>,
  { initialStale = true, expireAfter = 1000 * 60 * 60 * 12 }: TrackOptions = {},
  initialData?: T,
) => {
  let currentVersion = factory().version;
  let dataAsOf = initialStale ? 0 : Date.now();

  const state = {
    data: initialData,
    loading: false,
    errors: [] as number[],
    async run() {
      const { version, label, run } = factory();
      if (version !== currentVersion) {
        currentVersion = version;
        dataAsOf = 0;
        state.data = undefined;
        state.errors = [];
        store.set(state);
      }

      if (state.loading) return;
      if (Date.now() - dataAsOf < expireAfter) return;
      if (state.errors.length >= 4 && Date.now() - state.errors.at(-1)! < 2_000) return;
      if (state.errors.length >= 6 && Date.now() - state.errors.at(-1)! < 10_000) return;
      if (state.errors.length >= 8 && Date.now() - state.errors.at(-1)! < 60_000) return;

      state.loading = true;
      store.set(state);
      try {
        state.data = await trackProgress(label, run());
        dataAsOf = Date.now();
        state.errors = [];
      } catch (e) {
        console.error(`[${label}]`, e);
        state.errors.push(Date.now());
      } finally {
        state.loading = false;
        store.set(state);
      }
    },
  };

  const store = writable<typeof state>();
  store.set(state);
  return store;
};

export const trackCached = <T>(factory: TrackFactory<T>, opts: TrackOptions = {}) => {
  const cache = storageClient<CachedEntry<T>>(
    (key) => `.cache/${key}`,
    undefined,
    (data) => JSON.stringify(data),
    (str) => JSON.parse(str),
  );
  const { id, version } = factory();
  const cached = cache[id];
  const initialData = cached?.version === version ? cached.data : undefined;

  const result = track<T>(factory, opts, initialData);

  result.subscribe(({ data }) => {
    if (data !== undefined) {
      const { id, version } = factory();
      cache[id] = { version, data };
    }
  });

  return result;
};
