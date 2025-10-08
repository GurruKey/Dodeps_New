export const TRANSACTIONS_LOG_STORAGE_KEY = 'dodepus_admin_transactions_logs_v1';
export const MAX_DYNAMIC_TRANSACTION_LOGS = 300;

let transactionsDynamicLogsMemory = [];

const clone = (value) => JSON.parse(JSON.stringify(value));

const getStorage = () => {
  try {
    if (typeof globalThis === 'undefined') return null;
    return globalThis.localStorage ?? null;
  } catch (error) {
    console.warn('Локальное хранилище недоступно для логов транзакций админ-панели', error);
    return null;
  }
};

const readDynamicLogsFromStorage = (storage = getStorage()) => {
  if (!storage) {
    return transactionsDynamicLogsMemory.slice();
  }

  try {
    const raw = storage.getItem(TRANSACTIONS_LOG_STORAGE_KEY);
    if (!raw) return transactionsDynamicLogsMemory.slice();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return transactionsDynamicLogsMemory.slice();

    const normalized = parsed
      .filter((entry) => entry && typeof entry === 'object')
      .slice(0, MAX_DYNAMIC_TRANSACTION_LOGS);

    transactionsDynamicLogsMemory = normalized.slice();
    return normalized;
  } catch (error) {
    console.warn('Не удалось прочитать динамические логи транзакций админ-панели', error);
    return transactionsDynamicLogsMemory.slice();
  }
};

const writeDynamicLogsToStorage = (logs, storage = getStorage()) => {
  const normalized = Array.isArray(logs) ? logs.slice(0, MAX_DYNAMIC_TRANSACTION_LOGS) : [];
  transactionsDynamicLogsMemory = normalized.slice();

  if (!storage) return;

  try {
    storage.setItem(TRANSACTIONS_LOG_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn('Не удалось сохранить динамические логи транзакций админ-панели', error);
  }
};

const generateLogId = () =>
  `LOG-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

const normalizeString = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const sanitizeContext = (value) => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized ? normalized : undefined;
};

const sanitizeMetadata = (value) => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return undefined;
  }
};

const createTransactionLogEntry = (details = {}) => {
  const now = new Date().toISOString();
  const section = normalizeString(details.section, 'transactions') || 'transactions';
  const defaultAction =
    section === 'verification'
      ? 'Выполнил действие с верификацией'
      : section === 'transactions'
        ? 'Выполнил действие с транзакциями'
        : 'Выполнил действие';

  const entry = {
    id: generateLogId(),
    adminId: normalizeString(details.adminId, 'UNKNOWN'),
    adminName: normalizeString(details.adminName, 'Неизвестный админ'),
    role: normalizeString(details.role, 'admin'),
    section,
    action: normalizeString(details.action, defaultAction) || defaultAction,
    createdAt: now,
  };

  const context = sanitizeContext(details.context);
  if (context) {
    entry.context = context;
  }

  const metadata = sanitizeMetadata(details.metadata);
  if (metadata) {
    entry.metadata = metadata;
  }

  return entry;
};

export const TRANSACTIONS_STATIC_LOGS = Object.freeze([
  {
    id: 'LOG-2024-0006',
    adminId: 'ADM-002',
    adminName: 'Иван Ковалёв',
    role: 'manager',
    section: 'transactions',
    action: 'Одобрил вывод средств #784321',
    createdAt: '2024-04-15T11:35:00.000Z',
  },
]);

export const readTransactionLogs = ({ storage = getStorage() } = {}) => {
  const dynamicLogs = readDynamicLogsFromStorage(storage).map((entry) => clone(entry));
  const staticLogs = TRANSACTIONS_STATIC_LOGS.map((entry) => clone(entry));
  return [...dynamicLogs, ...staticLogs];
};

export const appendTransactionLog = (details = {}, storage = getStorage()) => {
  const entry = createTransactionLogEntry(details);
  const existing = readDynamicLogsFromStorage(storage);
  const nextLogs = [entry, ...existing];
  writeDynamicLogsToStorage(nextLogs, storage);
  return entry;
};

export const __internals = Object.freeze({
  TRANSACTIONS_LOG_STORAGE_KEY,
  MAX_DYNAMIC_TRANSACTION_LOGS,
  readDynamicLogsFromStorage,
  writeDynamicLogsToStorage,
  createTransactionLogEntry,
  getStorage,
});
