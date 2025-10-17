import {
  TRANSACTIONS_LOG_STORAGE_KEY,
  TRANSACTIONS_STATIC_LOGS,
  appendTransactionLog,
  readTransactionLogs,
} from '../transactions/index.js';
import {
  ADMIN_LOG_ROLE_LABELS,
  ADMIN_LOG_ROLE_OPTIONS,
  ADMIN_LOG_SECTION_LABELS,
  ADMIN_LOG_SECTION_OPTIONS,
  ADMIN_LOG_SECTIONS,
} from './constants.js';
import {
  getAdminLogSnapshot,
  listAdminLogRecords,
  readAdminLogRecords,
} from './storage/index.js';

const readStaticLogs = () => listAdminLogRecords();

const cloneOption = (option) => ({ ...option });
const cloneOptionList = (options) => options.map((option) => cloneOption(option));

const readTransactionsLogs = (options) =>
  readTransactionLogs(options).map((entry) => ({ ...entry }));

export const listAdminLogSections = () => cloneOptionList(ADMIN_LOG_SECTION_OPTIONS);

export const getAdminLogSections = () => listAdminLogSections();

export const listAdminLogRoleOptions = () => cloneOptionList(ADMIN_LOG_ROLE_OPTIONS);

export const getAdminLogRoleOptions = () => listAdminLogRoleOptions();

export const getAdminLogRoleLabel = (role) => ADMIN_LOG_ROLE_LABELS[role] ?? role;

export const getAdminLogSectionLabel = (section) => {
  return ADMIN_LOG_SECTION_LABELS[section] ?? section;
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
  ADMIN_LOG_SECTION_OPTIONS,
  ADMIN_LOG_SECTION_LABELS,
  ADMIN_LOG_ROLE_OPTIONS,
  ADMIN_LOG_ROLE_LABELS,
  readAdminLogRecords,
  getAdminLogSnapshot,
  TRANSACTIONS_LOG_STORAGE_KEY,
  TRANSACTIONS_STATIC_LOGS,
  readStaticLogs,
});
