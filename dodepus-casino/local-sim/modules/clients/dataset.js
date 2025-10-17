import {
  getAuthUsersSnapshot,
  listAuthUserRecords,
  pickExtras,
} from '../auth/index.js';
import { getLocalDatabase } from '../../database/engine.js';
import { PROFILES_TABLE } from './constants.js';

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

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? trimmed : date.toISOString();
  }

  return null;
};

const freezeObject = (value) => Object.freeze({ ...value });

const freezeArray = (value) => Object.freeze([...value]);

const normalizeProfileExtras = (extras) => {
  const normalized = pickExtras(extras);
  return {
    ...normalized,
    verificationRequests: freezeArray(ensureArray(normalized.verificationRequests)),
    verificationUploads: freezeArray(ensureArray(normalized.verificationUploads)),
    transactions: freezeArray(ensureArray(normalized.transactions)),
  };
};

const mapProfileRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toTrimmedString(row.id, '');
  if (!id) {
    return null;
  }

  const extras = normalizeProfileExtras({ ...row });

  const normalized = {
    id,
    ...extras,
    updatedAt: toNullableIsoString(row.updatedAt ?? row.updated_at ?? null),
    raw: freezeObject(safeClone(row)),
  };

  return Object.freeze(normalized);
};

const freezeRecords = (records) => Object.freeze(records.filter(Boolean));

const readClientRecords = () => getAuthUsersSnapshot().records;

const readProfileRecords = () => {
  const db = getLocalDatabase();
  const rows = ensureArray(db.select(PROFILES_TABLE));
  const records = rows.map((row) => mapProfileRow(row)).filter(Boolean);
  return freezeRecords(records);
};

const cloneProfile = (profile) => {
  if (!profile || typeof profile !== 'object') {
    return null;
  }

  return {
    ...profile,
    verificationRequests: ensureArray(profile.verificationRequests).slice(),
    verificationUploads: ensureArray(profile.verificationUploads).slice(),
    transactions: ensureArray(profile.transactions).slice(),
    raw: safeClone(profile.raw),
  };
};

export const getClientSnapshot = () => {
  const records = readClientRecords();
  const profiles = readProfileRecords();

  const byId = new Map();
  const byEmail = new Map();
  const byPhone = new Map();
  const profilesById = new Map();

  profiles.forEach((profile) => {
    profilesById.set(profile.id, profile);
  });

  records.forEach((record) => {
    byId.set(record.id, record);
    if (record.email) {
      byEmail.set(record.email, record);
    }
    if (record.phone) {
      byPhone.set(record.phone, record);
    }
  });

  return Object.freeze({
    records,
    profiles,
    byId,
    byEmail,
    byPhone,
    profilesById,
  });
};

export const listClientRecords = () => listAuthUserRecords();

export const listProfileRecords = () => readProfileRecords().map((profile) => cloneProfile(profile)).filter(Boolean);

export const findClientRecordById = (id) => {
  const snapshot = getClientSnapshot();
  return snapshot.byId.get(toTrimmedString(id, '')) ?? null;
};

export const findProfileByClientId = (id) => {
  const snapshot = getClientSnapshot();
  return snapshot.profilesById.get(toTrimmedString(id, '')) ?? null;
};

export const __internals = Object.freeze({
  safeClone,
  ensureArray,
  ensureObject,
  toTrimmedString,
  toLowerCaseString,
  toNullableIsoString,
  mapProfileRow,
  readClientRecords,
  readProfileRecords,
  cloneProfile,
});
