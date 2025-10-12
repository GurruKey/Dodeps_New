const memoryStorage = (() => {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
})();

export const getBrowserStorage = () => {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // ignore access errors (Safari private mode, SSR, etc.)
  }
  return memoryStorage;
};

export const safeParse = (value, fallback) => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return 'null';
  }
};
