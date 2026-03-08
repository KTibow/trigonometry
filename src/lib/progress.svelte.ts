import { untrack } from 'svelte';

export type ProgressItem = {
  id: number;
  label: string;
};

let nextProgressId = 1;
const progressItems = $state<ProgressItem[]>([]);

const removeProgressItem = (id: number) => {
  const index = progressItems.findIndex((item) => item.id === id);
  if (index >= 0) progressItems.splice(index, 1);
};

export const progress = {
  get items() {
    return progressItems;
  },
  get first() {
    return progressItems[0];
  },
  get isLoading() {
    return progressItems.length > 0;
  },
};

export const trackProgress = <T>(label: string, work: Promise<T>) =>
  untrack(async () => {
    const id = nextProgressId++;
    progressItems.push({ id, label });

    try {
      return await work;
    } finally {
      removeProgressItem(id);
    }
  });
