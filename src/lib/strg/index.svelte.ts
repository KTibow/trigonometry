import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

export type StorageChangeDetail = {
  key: string;
  value: string | undefined;
  isSync: boolean;
};

type StorageChangeListener = (detail: StorageChangeDetail) => void;
const storageChangeListeners = new Set<StorageChangeListener>();

export const onStorageChange = (listener: StorageChangeListener) => {
  storageChangeListeners.add(listener);

  return () => {
    storageChangeListeners.delete(listener);
  };
};

const notifyStorageChange = (detail: StorageChangeDetail) => {
  for (const listener of storageChangeListeners) {
    try {
      listener(detail);
    } catch (error) {
      console.error('[strg] storage listener failed', error);
    }
  }
};

const storageCounters = new SvelteMap<string, number>();
let allCounter = $state(0);

const trackStorageChange = (key: string, value: string | undefined, isSync = false) => {
  storageCounters.set(
    key,
    untrack(() => (storageCounters.get(key) ?? 0) + 1),
  );
  allCounter = untrack(() => allCounter + 1);
  notifyStorageChange({ key, value, isSync });
};

addEventListener('storage', (event) => {
  if (event.storageArea != localStorage) return;
  if (!event.key) return;

  trackStorageChange(event.key, event.newValue ?? undefined);
});

export const storageClient = (
  prefix?: (key: string) => string,
  unprefix?: (key: string) => string | undefined,
  serialize?: (data: any) => string,
  deserialize?: (data: string) => any,
  isSyncContext = false,
) => {
  if (prefix) {
    const oldPrefix = prefix;
    prefix = (key) => `strg/${oldPrefix(key)}`;
  } else {
    prefix = (key) => `strg/${key}`;
  }

  const getScopedKeys = () => {
    const keys: string[] = [];
    for (const key in localStorage) {
      if (!key.startsWith('strg/')) continue;
      let scopedKey = key.slice('strg/'.length);

      if (unprefix) {
        const unprefixed = unprefix(scopedKey);
        if (!unprefixed) continue;
        scopedKey = unprefixed;
      }

      keys.push(scopedKey);
    }
    return keys;
  };

  return new Proxy({} as Record<string, any>, {
    get(_, key) {
      if (typeof key == 'symbol') return undefined;

      key = prefix(key);

      untrack(() => {
        if (!storageCounters.has(key)) storageCounters.set(key, 0);
      });
      storageCounters.get(key);
      const raw = localStorage[key];
      return raw && deserialize ? deserialize(raw) : raw;
    },
    set(_, key: string, value) {
      key = prefix(key);
      if (serialize) value = serialize(value);

      if (localStorage[key] != value) {
        localStorage[key] = value;
        trackStorageChange(key, value, isSyncContext);
      } else {
        console.debug('[strg] noop for', key);
      }

      return true;
    },
    deleteProperty(_, key: string) {
      key = prefix(key);

      delete localStorage[key];
      trackStorageChange(key, undefined, isSyncContext);
      return true;
    },
    ownKeys() {
      allCounter;

      return getScopedKeys();
    },
    getOwnPropertyDescriptor(_, key: string) {
      key = prefix(key);

      return Reflect.getOwnPropertyDescriptor(localStorage, key);
    },
  });
};
