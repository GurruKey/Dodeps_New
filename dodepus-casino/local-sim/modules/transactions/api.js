import { readAdminClients } from '../clients/api.js';
import { getLocalDatabase } from '../../database/engine.js';

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

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const toIsoDate = (value) => {
  if (!value) return null;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
};

const normalizeType = (value) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'deposit') return 'deposit';
  if (normalized === 'withdraw') return 'withdraw';
  return normalized || 'other';
};

const normalizeStatus = (value) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'pending') return 'pending';
  if (normalized === 'failed') return 'failed';
  return 'success';
};

const resolveCurrency = (transaction, client) => {
  const currency = transaction?.currency || client?.profile?.currency || 'USD';
  if (typeof currency !== 'string') return 'USD';
  const trimmed = currency.trim();
  return trimmed ? trimmed.toUpperCase() : 'USD';
};

const normalizeTransaction = (transaction, client) => {
  if (!transaction) return null;

  const createdAt = toIsoDate(
    transaction.date ??
      transaction.createdAt ??
      transaction.timestamp ??
      transaction.created_at ??
      transaction.updated_at,
  );
  const baseId = transaction.id || createdAt || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const userId = transaction.userId || transaction.user_id || client?.id;
  if (!userId) {
    return null;
  }
  const entryId = `${userId}:${baseId}`;

  return {
    id: transaction.id || baseId,
    entryId,
    userId,
    userEmail: typeof client?.email === 'string' ? client.email : '',
    userNickname:
      typeof client?.profile?.nickname === 'string' ? client.profile.nickname : '',
    amount: toNumber(transaction.amount),
    currency: resolveCurrency(transaction, client),
    type: normalizeType(transaction.type ?? transaction.transaction_type),
    method:
      typeof transaction.method === 'string' && transaction.method.trim()
        ? transaction.method.trim()
        : typeof transaction.payment_method === 'string' && transaction.payment_method.trim()
          ? transaction.payment_method.trim()
        : 'other',
    status: normalizeStatus(transaction.status ?? transaction.transaction_status),
    createdAt,
  };
};

export const readAdminTransactions = () => {
  const clients = readAdminClients();
  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const db = getLocalDatabase();
  const rows = db.select('profile_transactions');

  const transactions = rows
    .map((transaction) => {
      const userId = transaction.userId ?? transaction.user_id;
      return normalizeTransaction(transaction, clientMap.get(userId));
    })
    .filter(Boolean);

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
  toNumber,
  toIsoDate,
  normalizeType,
  normalizeStatus,
  resolveCurrency,
  normalizeTransaction,
});
