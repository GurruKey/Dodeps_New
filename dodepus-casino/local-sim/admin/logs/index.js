import { ADMINISTRATORS_CHAT_LOGS } from './administratorsChat.js';
import { CLIENTS_LOGS } from './clients.js';
import { MODERATORS_CHAT_LOGS } from './moderatorsChat.js';
import { PROMOCODES_LOGS } from './promocodes.js';
import { ROLE_EDIT_LOGS } from './roleEdit.js';
import { ROLES_LOGS } from './roles.js';
import {
  TRANSACTIONS_LOG_STORAGE_KEY,
  TRANSACTIONS_STATIC_LOGS,
  appendTransactionLog,
  readTransactionLogs,
} from './transactions.js';
import { VERIFICATION_LOGS } from './verification.js';

const ADMIN_LOG_SECTIONS = Object.freeze([
  { value: 'overview', label: 'Обзор' },
  { value: 'clients', label: 'Клиенты' },
  { value: 'promocodes', label: 'Промокоды' },
  { value: 'roles', label: 'Выдать роль' },
  { value: 'role-edit', label: 'Изменить роль' },
  { value: 'transactions', label: 'Транзакции' },
  { value: 'verification', label: 'Верификация' },
  { value: 'moderators-chat', label: 'Чат модераторов' },
  { value: 'administrators-chat', label: 'Админ Чат' },
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

const OVERVIEW_LOGS = Object.freeze([
  {
    id: 'LOG-2024-0003',
    adminId: 'ADM-003',
    adminName: 'Мария Лебедева',
    role: 'analyst',
    section: 'overview',
    action: 'Экспортировала отчёт по вовлечённости за неделю',
    createdAt: '2024-04-15T10:17:00.000Z',
  },
]);

const STATIC_SECTION_LOGS = Object.freeze([
  ...OVERVIEW_LOGS,
  ...CLIENTS_LOGS,
  ...PROMOCODES_LOGS,
  ...ROLES_LOGS,
  ...ROLE_EDIT_LOGS,
  ...VERIFICATION_LOGS,
  ...MODERATORS_CHAT_LOGS,
  ...ADMINISTRATORS_CHAT_LOGS,
]);

const clone = (value) => JSON.parse(JSON.stringify(value));

const readStaticLogs = () => STATIC_SECTION_LOGS.map((entry) => clone(entry));

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
  TRANSACTIONS_LOG_STORAGE_KEY,
  TRANSACTIONS_STATIC_LOGS,
});
