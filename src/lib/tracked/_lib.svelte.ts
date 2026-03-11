import { trackProgress } from '../progress.svelte';
import { cache } from '../strg/common.svelte';
import { getTodayKey } from '../today.svelte';

type VersionedCacheEntry<Value> = {
  value: Value;
  version?: string;
};

type FetchState<Value> =
  | { phase: 'idle' }
  | { phase: 'pending' }
  | { phase: 'done'; value: Value }
  | { phase: 'error'; error: unknown };

export const readCache = <Value>(key: string) => cache[key] as Value | undefined;

export const writeCache = <Value>(key: string, value: Value) => {
  cache[key] = value;
};

export type CacheHandle<Value> = {
  read: () => Value | undefined;
  write: (value: Value) => void;
};

type TrackedRun<Value> = {
  cache: CacheHandle<Value>;
  load: (signal: AbortSignal) => Promise<Value | undefined>;
};

export type Tracked<Value> = {
  readonly current: Value | undefined;
  readonly loading: boolean;
  readonly error: unknown;
};

type TrackedTuple<Value> = [tracked: Tracked<Value>, stop: () => void];

const readVersionedCache = <Value>(key: string) => readCache<VersionedCacheEntry<Value>>(key);

export const versionedCache = <Value>(key: string, version?: string): CacheHandle<Value> => ({
  read: () => {
    const entry = readVersionedCache<Value>(key);
    if (!entry || entry.version !== version) {
      return undefined;
    }

    return entry.value;
  },
  write: (value) => writeCache<VersionedCacheEntry<Value>>(key, { value, version }),
  // if you want to check fresh, readVersionedCache<Value>(key)?.version === version
});

export const dailyCache = <Value>(key: string, version?: string): CacheHandle<Value> =>
  versionedCache(key, version == undefined ? getTodayKey() : `${version}/${getTodayKey()}`);

const makeFetcher = <Input, Value>(
  label: string,
  load: (input: Input, signal: AbortSignal) => Promise<Value>,
) => {
  let state = $state<FetchState<Value>>({ phase: 'idle' });
  let controller: AbortController | undefined;

  const clear = () => {
    controller?.abort();
    controller = undefined;
    state = { phase: 'idle' };
  };

  return {
    get state() {
      return state;
    },
    run(input: Input, onDone: (value: Value) => void) {
      controller?.abort();
      controller = new AbortController();
      const nextController = controller;

      state = { phase: 'pending' };

      trackProgress(
        label,
        Promise.resolve().then(() => load(input, nextController.signal)),
      ).then(
        (value) => {
          if (controller != nextController || nextController.signal.aborted) {
            return;
          }

          onDone(value);
          state = { phase: 'done', value };
          controller = undefined;
        },
        (error) => {
          if (controller != nextController || nextController.signal.aborted) {
            return;
          }

          state = { phase: 'error', error };
          controller = undefined;
        },
      );
    },
    clear,
  };
};

export const makeTracked = <Value>({
  label,
  run,
  pollMs,
  retryMs = 30_000,
}: {
  label: string;
  run: () => TrackedRun<Value> | undefined;
  pollMs?: number;
  retryMs?: number;
}): TrackedTuple<Value> => {
  let current = $state<Value | undefined>(undefined);
  let refreshVersion = $state(0);

  const fetcher = makeFetcher<TrackedRun<Value>, Value | undefined>(
    label,
    (trackedRun, signal) => trackedRun.load(signal),
  );

  const load = (trackedRun: TrackedRun<Value>) => {
    fetcher.run(trackedRun, (value) => {
      if (value == undefined) {
        return;
      }

      trackedRun.cache.write(value);
      current = value;
    });
  };

  const stop = $effect.root(() => {
    const poll = pollMs ? setInterval(() => refreshVersion++, pollMs) : undefined;

    $effect(() => {
      if (fetcher.state.phase != 'error') {
        return;
      }

      const retry = setTimeout(() => refreshVersion++, retryMs);
      return () => clearTimeout(retry);
    });

    $effect(() => {
      refreshVersion;

      const trackedRun = run();
      if (!trackedRun) {
        fetcher.clear();
        return;
      }

      load(trackedRun);
    });

    $effect(() => {
      const trackedRun = run();
      if (!trackedRun) {
        current = undefined;
        return;
      }

      current = trackedRun.cache.read();
    });

    return () => {
      if (poll != undefined) {
        clearInterval(poll);
      }

      fetcher.clear();
    };
  });

  return [
    {
      get current() {
        return current;
      },
      get loading() {
        return fetcher.state.phase == 'pending';
      },
      get error() {
        const state = fetcher.state;
        return state.phase == 'error' ? state.error : undefined;
      },
    } satisfies Tracked<Value>,
    stop,
  ];
};
