const STORAGE_KEY = 'dodepus_role_permission_actions_v1';
const MAX_LOGS = 200;

let memoryLogs = [];

const getStorage = () => {
  try {
    if (typeof globalThis === 'undefined') return null;
    return globalThis.localStorage ?? null;
  } catch (error) {
    console.warn('Локальное хранилище недоступно для лога изменений ролей', error);
    return null;
  }
};

const normalizeString = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed ? trimmed : '';
};

const toBoolean = (value) => Boolean(value);

const generateLogId = () => `ROLE-ACT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const readLogsFromStorage = (storage = getStorage()) => {
  if (!storage) {
    return memoryLogs.slice();
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return memoryLogs.slice();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return memoryLogs.slice();

    const limited = parsed.slice(0, MAX_LOGS);
    memoryLogs = limited.slice();
    return limited;
  } catch (error) {
    console.warn('Не удалось прочитать лог изменения разрешений ролей', error);
    return memoryLogs.slice();
  }
};

const writeLogsToStorage = (logs, storage = getStorage()) => {
  const normalized = Array.isArray(logs) ? logs.slice(0, MAX_LOGS) : [];
  memoryLogs = normalized.slice();

  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn('Не удалось сохранить лог изменения разрешений ролей', error);
  }
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const createLogEntry = (details = {}) => {
  const roleId = normalizeString(details.roleId);
  const permissionKey = normalizeString(details.permissionKey);
  const entry = {
    id: generateLogId(),
    roleId,
    roleName: normalizeString(details.roleName),
    permissionKey,
    permissionLabel: normalizeString(details.permissionLabel) || permissionKey,
    previousValue: toBoolean(details.previousValue),
    nextValue: toBoolean(details.nextValue),
    comment: normalizeString(details.comment),
    createdAt: new Date().toISOString(),
  };

  return entry;
};

export const appendRolePermissionLog = (details = {}, storage = getStorage()) => {
  const entry = createLogEntry(details);
  const existing = readLogsFromStorage(storage);
  const nextLogs = [entry, ...existing];
  writeLogsToStorage(nextLogs, storage);
  return entry;
};

export const listRolePermissionLogs = (storage = getStorage()) =>
  readLogsFromStorage(storage).map((entry) => clone(entry));

export const clearRolePermissionLogs = (storage = getStorage()) => {
  memoryLogs = [];
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Не удалось очистить лог изменения разрешений ролей', error);
  }
};

export const __internals = Object.freeze({
  STORAGE_KEY,
  MAX_LOGS,
  readLogsFromStorage,
  writeLogsToStorage,
  createLogEntry,
  clone,
});

