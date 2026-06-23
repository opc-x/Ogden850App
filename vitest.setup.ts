import { beforeEach, vi } from 'vitest';

const store = new Map<string, string>();

function mockStorage(): Storage {
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
  };
}

beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', mockStorage());
});
