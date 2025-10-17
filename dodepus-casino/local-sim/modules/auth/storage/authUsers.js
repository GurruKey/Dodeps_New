import { getLocalDatabase } from '../../shared/localDatabase.js';
import { AUTH_USERS_TABLE, DEFAULT_AUTH_STATUS } from '../constants.js';

const safeClone = (value) => {
  if (value == null) {
    return value;
  }

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // ignore structuredClone failures
    }
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const ensureObject = (value) => (value && typeof value === 'object' ? { ...value } : {});

const toTrimmedString = (value, fallback = '') => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    const text = String(value).trim();
    return text || fallback;
  }

  return fallback;
};

const toLowerCaseString = (value, fallback = '') => {
  const text = toTrimmedString(value, '');
  return text ? text.toLowerCase() : fallback;
};

const toNullableIsoString = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString();
  }

  return null;
};

const freezeObject = (value) => Object.freeze({ ...value });

const freezeArray = (value) => Object.freeze([...value]);

const freezeMap = (map) => Object.freeze(map);

const normalizeRoles = (roles) => {
  const normalized = [];

  ensureArray(roles)
    .map((role) => toLowerCaseString(role, ''))
    .filter(Boolean)
    .forEach((role) => {
      if (!normalized.includes(role)) {
        normalized.push(role);
      }
    });

  if (!normalized.includes('user')) {
    normalized.push('user');
  }

  return normalized;
};

const normalizeMetadata = (metadata) => {
  const normalized = ensureObject(metadata);

  if ('role' in normalized) {
    const role = toLowerCaseString(normalized.role, '');
    if (role) {
      normalized.role = role;
    } else {
      delete normalized.role;
    }
  }

  if ('roles' in normalized) {
    const roles = normalizeRoles(normalized.roles);
    normalized.roles = roles.length ? roles : undefined;
  }

  if ('playerRankId' in normalized) {
    normalized.playerRankId = toTrimmedString(normalized.playerRankId, '') || undefined;
  }

  if (
    'playerRankTier' in normalized &&
    normalized.playerRankTier !== undefined &&
    !Number.isFinite(Number(normalized.playerRankTier))
  ) {
    delete normalized.playerRankTier;
  }

  return normalized;
};

const freezeMetadata = (metadata) => {
  const normalized = normalizeMetadata(metadata);

  if (Array.isArray(normalized.roles)) {
    normalized.roles = freezeArray(normalized.roles);
  }

  return freezeObject(normalized);
};

const mapAuthUserRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toTrimmedString(row.id, '');
  if (!id) {
    return null;
  }

  const base = ensureObject(row);
  const appMetadata = freezeMetadata(base.app_metadata);
  const userMetadata = freezeMetadata(base.user_metadata);
  const roles = normalizeRoles(base.roles ?? appMetadata.roles ?? userMetadata.roles ?? []);

  const normalized = {
    ...base,
    id,
    email: toLowerCaseString(base.email ?? base.user_email ?? ''),
    phone: toTrimmedString(base.phone ?? base.user_phone ?? ''),
    password: toTrimmedString(base.password ?? base.password_hash ?? ''),
    created_at: toNullableIsoString(base.created_at),
    confirmed_at: toNullableIsoString(base.confirmed_at),
    email_confirmed_at: toNullableIsoString(base.email_confirmed_at),
    phone_confirmed_at: toNullableIsoString(base.phone_confirmed_at),
    last_sign_in_at: toNullableIsoString(base.last_sign_in_at),
    status: toLowerCaseString(base.status, DEFAULT_AUTH_STATUS) || DEFAULT_AUTH_STATUS,
    app_metadata: appMetadata,
    user_metadata: userMetadata,
    roles: freezeArray(roles),
    raw: freezeObject(safeClone(row)),
  };

  if (normalized.role) {
    normalized.role = toLowerCaseString(normalized.role, '');
  }

  if (!normalized.role && typeof normalized.app_metadata.role === 'string') {
    normalized.role = normalized.app_metadata.role;
  }

  if (!normalized.role && typeof normalized.user_metadata.role === 'string') {
    normalized.role = normalized.user_metadata.role;
  }

  if (normalized.roleLevel != null && !Number.isFinite(Number(normalized.roleLevel))) {
    delete normalized.roleLevel;
  }

  return Object.freeze(normalized);
};

const freezeRecords = (records) => Object.freeze(records.filter(Boolean));

const readAuthUserRecords = () => {
  const db = getLocalDatabase();
  const rows = ensureArray(db.select(AUTH_USERS_TABLE));
  return rows.map((row) => mapAuthUserRow(row)).filter(Boolean);
};

const buildIndexes = (records) => {
  const byId = new Map();
  const byEmail = new Map();
  const byPhone = new Map();

  records.forEach((record) => {
    byId.set(record.id, record);
    if (record.email) {
      byEmail.set(record.email, record);
    }
    if (record.phone) {
      byPhone.set(record.phone, record);
    }
  });

  return {
    byId: freezeMap(byId),
    byEmail: freezeMap(byEmail),
    byPhone: freezeMap(byPhone),
  };
};

const cloneAuthUserRecord = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const clone = { ...record };
  clone.roles = ensureArray(record.roles).slice();
  clone.app_metadata = ensureObject(record.app_metadata);
  clone.user_metadata = ensureObject(record.user_metadata);
  clone.raw = safeClone(record.raw);
  return clone;
};

const ensureRoleLevel = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.trunc(numeric);
  }

  return undefined;
};

const prepareAuthUserRow = (record) => {
  const base = ensureObject(record?.raw ?? record);
  const id = toTrimmedString(base.id ?? record?.id, '');
  if (!id) {
    return null;
  }

  const roles = normalizeRoles(record?.roles ?? base.roles ?? []);
  const status =
    toLowerCaseString(record?.status ?? base.status, DEFAULT_AUTH_STATUS) || DEFAULT_AUTH_STATUS;

  const appMetadata = normalizeMetadata(record?.app_metadata ?? base.app_metadata);
  const userMetadata = normalizeMetadata(record?.user_metadata ?? base.user_metadata);

  if (roles.length) {
    appMetadata.roles = roles.slice();
    userMetadata.roles = roles.slice();
  } else {
    delete appMetadata.roles;
    delete userMetadata.roles;
  }

  const isAdmin = roles.includes('admin');

  if (isAdmin) {
    appMetadata.isAdmin = true;
    userMetadata.isAdmin = true;
  } else {
    if (appMetadata.isAdmin !== true) {
      delete appMetadata.isAdmin;
    }
    if (userMetadata.isAdmin !== true) {
      delete userMetadata.isAdmin;
    }
  }

  const prepared = {
    ...base,
    id,
    email: toLowerCaseString(record?.email ?? base.email ?? ''),
    phone: toTrimmedString(record?.phone ?? base.phone ?? ''),
    password: toTrimmedString(record?.password ?? base.password ?? ''),
    created_at: toNullableIsoString(record?.created_at ?? base.created_at),
    confirmed_at: toNullableIsoString(record?.confirmed_at ?? base.confirmed_at),
    email_confirmed_at: toNullableIsoString(
      record?.email_confirmed_at ?? base.email_confirmed_at
    ),
    phone_confirmed_at: toNullableIsoString(record?.phone_confirmed_at ?? base.phone_confirmed_at),
    last_sign_in_at: toNullableIsoString(record?.last_sign_in_at ?? base.last_sign_in_at),
    status,
    role: toLowerCaseString(record?.role ?? base.role ?? ''),
    roleId: toTrimmedString(record?.roleId ?? record?.role_id ?? base.roleId ?? base.role_id ?? '', ''),
    roleLevel: ensureRoleLevel(record?.roleLevel ?? record?.role_level ?? base.roleLevel),
    roles,
    app_metadata: appMetadata,
    user_metadata: userMetadata,
  };

  if (!prepared.role) {
    delete prepared.role;
  }

  if (!prepared.roleId) {
    delete prepared.roleId;
    delete prepared.role_id;
  }

  if (typeof prepared.roleLevel !== 'number') {
    delete prepared.roleLevel;
  }

  if (!prepared.roles || !prepared.roles.length) {
    delete prepared.roles;
  }

  return prepared;
};

const prepareAuthUserRows = (records) =>
  ensureArray(records)
    .map((record) => prepareAuthUserRow(record))
    .filter(Boolean);

const writeAuthUsersDataset = (records) => {
  const rows = prepareAuthUserRows(records);
  const db = getLocalDatabase();
  db.replaceWhere(AUTH_USERS_TABLE, () => true, rows);
  return rows;
};

export const getAuthUsersSnapshot = () => {
  const records = freezeRecords(readAuthUserRecords());
  const indexes = buildIndexes(records);
  return Object.freeze({
    records,
    ...indexes,
  });
};

export const listAuthUserRecords = () =>
  readAuthUserRecords()
    .map((record) => cloneAuthUserRecord(record))
    .filter(Boolean);

export const findAuthUserById = (id) => {
  if (!id) {
    return null;
  }
  const snapshot = getAuthUsersSnapshot();
  return snapshot.byId.get(toTrimmedString(id, '')) ?? null;
};

export const findAuthUserByEmail = (email) => {
  if (!email) {
    return null;
  }
  const snapshot = getAuthUsersSnapshot();
  return snapshot.byEmail.get(toLowerCaseString(email, '')) ?? null;
};

export const findAuthUserByPhone = (phone) => {
  if (!phone) {
    return null;
  }
  const snapshot = getAuthUsersSnapshot();
  return snapshot.byPhone.get(toTrimmedString(phone, '')) ?? null;
};

export const updateAuthUsersDataset = (records) => writeAuthUsersDataset(records);

export const __internals = Object.freeze({
  safeClone,
  ensureArray,
  ensureObject,
  toTrimmedString,
  toLowerCaseString,
  toNullableIsoString,
  normalizeRoles,
  normalizeMetadata,
  mapAuthUserRow,
  readAuthUserRecords,
  buildIndexes,
  cloneAuthUserRecord,
  ensureRoleLevel,
  prepareAuthUserRow,
  prepareAuthUserRows,
  writeAuthUsersDataset,
});
