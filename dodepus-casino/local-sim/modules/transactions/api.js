import { readAdminClients } from '../clients/api.js';
import { getTransactionSnapshot } from './storage/index.js';

export const ADMIN_TRANSACTIONS_EVENT = 'dodepus:admin-transactions-change';

const getEventTarget = () => {
  if (typeof window !== 'undefined') return window;
  if (typeof globalThis !== 'undefined' && globalThis?.addEventListener) {
    return globalThis;
  }
  return null;
};

const createAbortError = (reason) => {
  if (reason instanceof Error) return reason;
  if (typeof DOMException === 'function') {
    return new DOMException('Aborted', 'AbortError');
  }
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
};

export const readAdminTransactions = () => {
  const clients = readAdminClients();
  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const snapshot = getTransactionSnapshot();

  const transactions = snapshot.records.map((record) => {
    const client = clientMap.get(record.userId);
    const userEmail = typeof client?.email === 'string' ? client.email : '';
    const userNickname =
      typeof client?.profile?.nickname === 'string' ? client.profile.nickname : '';
    const clientCurrency =
      typeof client?.profile?.currency === 'string' ? client.profile.currency.trim() : '';
    const rowCurrency =
      record?.raw && typeof record.raw.currency === 'string' ? record.raw.currency.trim() : '';
    const currency = rowCurrency
      ? record.currency
      : clientCurrency
        ? clientCurrency.toUpperCase()
        : record.currency;

    return {
      id: record.id,
      entryId: `${record.userId}:${record.id}`,
      userId: record.userId,
      userEmail,
      userNickname,
      amount: record.amount,
      currency,
      type: record.type,
      method: record.method,
      status: record.status,
      createdAt: record.createdAt,
    };
  });

  transactions.sort((a, b) => {
    const timeA = a.createdAt ? Date.parse(a.createdAt) : 0;
    const timeB = b.createdAt ? Date.parse(b.createdAt) : 0;
    return timeB - timeA;
  });

  return transactions;
};

export function listAdminTransactions({ signal, delay = 200 } = {}) {
  if (signal?.aborted) {
    return Promise.reject(createAbortError(signal.reason));
  }

  return new Promise((resolve, reject) => {
    const timeout = Math.max(0, delay);

    const complete = () => {
      try {
        const transactions = readAdminTransactions().map((transaction) => ({ ...transaction }));
        resolve(transactions);
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
}

const emitTransactionsChanged = (detail) => {
  const target = getEventTarget();
  if (!target?.dispatchEvent || typeof CustomEvent !== 'function') return;

  try {
    target.dispatchEvent(new CustomEvent(ADMIN_TRANSACTIONS_EVENT, { detail: detail ?? null }));
  } catch (error) {
    console.warn('Failed to emit admin transactions change event', error);
  }
};

export const notifyAdminTransactionsChanged = (detail) => emitTransactionsChanged(detail);

export const subscribeToAdminTransactions = (callback) => {
  const target = getEventTarget();
  if (!target?.addEventListener || typeof callback !== 'function') {
    return () => {};
  }

  const handler = (event) => {
    try {
      callback(event?.detail ?? null);
    } catch (error) {
      console.warn('Failed to handle admin transactions subscription callback', error);
    }
  };

  target.addEventListener(ADMIN_TRANSACTIONS_EVENT, handler);
  return () => {
    target.removeEventListener(ADMIN_TRANSACTIONS_EVENT, handler);
  };
};

export const __internals = Object.freeze({
  createAbortError,
  getEventTarget,
});
