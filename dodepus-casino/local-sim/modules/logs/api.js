import {
  TRANSACTIONS_LOG_STORAGE_KEY,
  TRANSACTIONS_STATIC_LOGS,
  appendTransactionLog,
  readTransactionLogs,
} from '../transactions/logs.js';
import { getLocalDatabase } from '../../database/engine.js';

const ADMIN_LOG_SECTIONS = Object.freeze([
  { value: 'overview', label: 'Обзор' },
  { value: 'clients', label: 'Клиенты' },
  { value: 'promocodes', label: 'Promo' },
  { value: 'promocode-create', label: 'Создать Promo' },
  { value: 'promocode-archive', label: 'Архив Promo' },
  { value: 'roles', label: 'Выдать роль' },
  { value: 'role-edit', label: 'Изменить роль' },
  { value: 'verification', label: 'Верификация' },
  { value: 'transactions', label: 'Транзакции' },
  { value: 'moderators-chat', label: 'Модератор Чат' },
  { value: 'administrators-chat', label: 'Админ Чат' },
  { value: 'staff-chat', label: 'Стаф Чат' },
  { value: 'log-admin', label: 'Log Admin' },
]);

const ADMIN_LOG_ROLE_LABELS = Object.freeze({
  admin: 'Админ',
  superadmin: 'Суперадмин',
  manager: 'Менеджер',
  moderator: 'Модератор',
  analyst: 'Аналитик',
  operator: 'Оператор',
  owner: 'Владелец',
});

const ADMIN_LOGS_TABLE = 'admin_logs';

const OVERVIEW_LOGS = Object.freeze([]);

const STATIC_SECTION_LOGS = Object.freeze([...OVERVIEW_LOGS]);

const clone = (value) => JSON.parse(JSON.stringify(value));

const toTrimmedString = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }

  return '';
};

const toOptionalString = (value) => {
  const text = toTrimmedString(value);
  return text || undefined;
};

const toIsoDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const mapAdminLogRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toTrimmedString(row.id);
  if (!id) {
    return null;
  }

  const adminId = toTrimmedString(row.admin_id ?? row.adminId) || 'UNKNOWN';
  const adminName = toTrimmedString(row.admin_name ?? row.adminName) || 'Неизвестный админ';
  const role = (toTrimmedString(row.role) || 'admin').toLowerCase();
  const section = (toTrimmedString(row.section) || 'overview').toLowerCase();
  const action = toTrimmedString(row.action) || 'Выполнил действие';
  const createdAt = toIsoDate(row.created_at ?? row.createdAt ?? row.timestamp);
  const context = toOptionalString(row.context ?? row.details);
  const metadata =
    row.metadata && typeof row.metadata === 'object' ? clone(row.metadata) : undefined;

  const entry = {
    id,
    adminId,
    adminName,
    role,
    section,
    action,
    createdAt,
  };

  if (context) {
    entry.context = context;
  }

  if (metadata) {
    entry.metadata = metadata;
  }

  return entry;
};

const getTimestamp = (value) => {
  if (!value) {
    return 0;
  }
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortByCreatedAtDesc = (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt);

const readStaticLogs = () => {
  const db = getLocalDatabase();
  const tableRows = db.select(ADMIN_LOGS_TABLE).map((row) => mapAdminLogRow(row)).filter(Boolean);
  const legacyStaticLogs = STATIC_SECTION_LOGS.map((entry) => clone(entry));
  const merged = [...tableRows, ...legacyStaticLogs];
  return merged.sort(sortByCreatedAtDesc);
};

const readTransactionsLogs = (options) =>
  readTransactionLogs(options).map((entry) => clone(entry));

export const getAdminLogSections = () => ADMIN_LOG_SECTIONS.map((entry) => clone(entry));

export const getAdminLogRoleOptions = () =>
  Object.entries(ADMIN_LOG_ROLE_LABELS).map(([value, label]) => ({ value, label }));

export const getAdminLogRoleLabel = (role) => ADMIN_LOG_ROLE_LABELS[role] ?? role;

export const getAdminLogSectionLabel = (section) => {
  const found = ADMIN_LOG_SECTIONS.find((option) => option.value === section);
  return found ? found.label : section;
};

export const readAdminLogs = ({ storage } = {}) => {
  const transactionsLogs = readTransactionsLogs({ storage });
  const staticLogs = readStaticLogs();
  return [...transactionsLogs, ...staticLogs];
};

export const appendAdminLog = appendTransactionLog;

const createAbortError = (reason) => {
  if (reason instanceof Error) return reason;
  if (typeof DOMException === 'function') {
    return new DOMException('Aborted', 'AbortError');
  }
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
};

export function listAdminLogs({ signal, delay = 200 } = {}) {
  if (signal?.aborted) {
    return Promise.reject(createAbortError(signal.reason));
  }

  return new Promise((resolve, reject) => {
    const timeout = Math.max(0, delay);

    const complete = () => {
      try {
        resolve(readAdminLogs({ storage: undefined }));
      } catch (error) {
        reject(error);
      }
    };

    if (!timeout) {
      complete();
      return;
    }

    const timer = setTimeout(() => {
      complete();
    }, timeout);

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

export const __internals = Object.freeze({
  ADMIN_LOG_SECTIONS,
  ADMIN_LOG_ROLE_LABELS,
  OVERVIEW_LOGS,
  STATIC_SECTION_LOGS,
  ADMIN_LOGS_TABLE,
  mapAdminLogRow,
  sortByCreatedAtDesc,
  TRANSACTIONS_LOG_STORAGE_KEY,
  TRANSACTIONS_STATIC_LOGS,
  readStaticLogs,
});
