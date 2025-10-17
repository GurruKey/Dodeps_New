import { createAbortError, ensureSeededRecords, mapAndSortPromocodes } from '../core/index.js';

const ARCHIVED_PROMOCODE_STATUSES = new Set(['expired', 'paused', 'archived']);

export const listAdminPromocodes = ({ signal, delay = 200 } = {}) => {
  if (signal?.aborted) {
    return Promise.reject(createAbortError(signal.reason));
  }

  ensureSeededRecords();

  return new Promise((resolve, reject) => {
    const timeout = Math.max(0, delay ?? 0);

    const complete = () => {
      try {
        const prepared = mapAndSortPromocodes();
        resolve(prepared);
      } catch (error) {
        reject(error);
      }
    };

    if (!timeout) {
      complete();
      return;
    }

    const timer = setTimeout(complete, timeout);

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(createAbortError(signal.reason));
        },
        { once: true },
      );
    }
  });
};

export const listAdminArchivedPromocodes = async ({ signal, delay = 200 } = {}) => {
  const data = await listAdminPromocodes({ signal, delay });
  return data.filter((promocode) => ARCHIVED_PROMOCODE_STATUSES.has(promocode.status));
};
