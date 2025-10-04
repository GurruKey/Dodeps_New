import { ADMIN_PROMOCODES_STORAGE_KEY } from './constants';

const memoryStore = {
  records: null,
};

const tryGetLocalStorage = () => {
  try {
    if (typeof globalThis === 'undefined') return null;
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const readFromStorage = () => {
  const storage = tryGetLocalStorage();
  if (storage) {
    try {
      const raw = storage.getItem(ADMIN_PROMOCODES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryStore.records = parsed;
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to read promo codes from localStorage', error);
    }
  }

  if (Array.isArray(memoryStore.records)) {
    return memoryStore.records;
  }

  return [];
};

const writeToStorage = (records) => {
  const normalized = Array.isArray(records) ? records : [];
  memoryStore.records = normalized;

  const storage = tryGetLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(ADMIN_PROMOCODES_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn('Failed to write promo codes to localStorage', error);
  }
};

export const storageAdapter = Object.freeze({
  tryGetLocalStorage,
  readFromStorage,
  writeToStorage,
});
