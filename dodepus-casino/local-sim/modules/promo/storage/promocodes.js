import { getLocalDatabase } from '../../../database/index.js';
import { ADMIN_PROMOCODES_TABLE } from '../constants.js';

const cloneDeep = (value) => {
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

const normalizeString = (value, fallback = '') => {
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

const toNullableNumber = (value) => {
  if (value == null || value === '') {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return numeric;
};

const toNullablePositiveInt = (value) => {
  if (value == null || value === '') {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }

  return Math.floor(numeric);
};

const toNonNegativeInt = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }

  return Math.floor(numeric);
};

const mapActivationRow = (entry, code, index) => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const activatedAt =
    entry.activated_at ?? entry.activatedAt ?? entry.created_at ?? entry.createdAt ?? null;
  if (!activatedAt) {
    return null;
  }

  const activation = {
    id: normalizeString(
      entry.id,
      `${code}_activation_${String(index + 1).padStart(3, '0')}`,
    ),
    activated_at: activatedAt,
  };

  const clientId =
    entry.client_id ?? entry.clientId ?? entry.player_id ?? entry.playerId ?? null;
  if (typeof clientId === 'string' && clientId.trim()) {
    activation.client_id = clientId.trim();
  }

  return activation;
};

export const mapPromocodeRowToRecord = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const code = normalizeString(row.code, '');
  if (!code) {
    return null;
  }

  const params = row.params && typeof row.params === 'object' ? row.params : {};
  const activations = Array.isArray(row.activations)
    ? row.activations
        .map((entry, index) => {
          const normalized = mapActivationRow(entry, code, index);
          if (!normalized) {
            return null;
          }
          const mapped = {
            id: normalized.id,
            activatedAt: normalized.activated_at,
          };
          if (normalized.client_id) {
            mapped.clientId = normalized.client_id;
          }
          return mapped;
        })
        .filter(Boolean)
    : [];

  return {
    id: normalizeString(row.id, code) || code,
    typeId: normalizeString(row.type_id ?? row.typeId, 'generic'),
    code,
    title: normalizeString(row.title, ''),
    reward: normalizeString(row.reward, ''),
    status: normalizeString(row.status, 'draft').toLowerCase(),
    limit: toNullablePositiveInt(row.limit),
    used: toNonNegativeInt(row.used, 0),
    wager: toNullableNumber(row.wager),
    cashoutCap: toNullableNumber(row.cashout_cap ?? row.cashoutCap),
    notes: normalizeString(row.notes, ''),
    params,
    startsAt: row.starts_at ?? row.startsAt ?? null,
    endsAt: row.ends_at ?? row.endsAt ?? null,
    createdAt: row.created_at ?? row.createdAt ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
    activations,
  };
};

export const mapPromocodeRecordToRow = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const code = normalizeString(record.code, '');
  if (!code) {
    return null;
  }

  const id = normalizeString(record.id, code) || code;
  const typeId = normalizeString(record.typeId ?? record.type_id, 'generic');
  const params = record.params && typeof record.params === 'object' ? record.params : {};

  const activations = Array.isArray(record.activations)
    ? record.activations
        .map((entry, index) => {
          if (!entry || typeof entry !== 'object') {
            return null;
          }

          const activatedAt =
            entry.activatedAt ?? entry.activated_at ?? entry.createdAt ?? entry.created_at ?? null;
          if (!activatedAt) {
            return null;
          }

          const activationId = normalizeString(
            entry.id,
            `${code}_activation_${String(index + 1).padStart(3, '0')}`,
          );

          const activation = {
            id: activationId,
            activated_at: activatedAt,
          };

          const clientId =
            entry.clientId ?? entry.client_id ?? entry.playerId ?? entry.player_id ?? null;
          if (typeof clientId === 'string' && clientId.trim()) {
            activation.client_id = clientId.trim();
          }

          return activation;
        })
        .filter(Boolean)
    : [];

  return {
    id,
    code,
    type_id: typeId,
    title: normalizeString(record.title, code),
    reward: normalizeString(record.reward, ''),
    status: normalizeString(record.status, 'draft').toLowerCase(),
    limit: toNullablePositiveInt(record.limit),
    used: toNonNegativeInt(record.used, 0),
    wager: toNullableNumber(record.wager),
    cashout_cap: toNullableNumber(record.cashoutCap ?? record.cashout_cap),
    notes: normalizeString(record.notes, ''),
    params,
    starts_at: record.startsAt ?? record.starts_at ?? null,
    ends_at: record.endsAt ?? record.ends_at ?? null,
    created_at: record.createdAt ?? record.created_at ?? null,
    updated_at: record.updatedAt ?? record.updated_at ?? null,
    activations,
  };
};

export const clonePromocodeRecord = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const params = record.params && typeof record.params === 'object' ? cloneDeep(record.params) : {};
  const activations = Array.isArray(record.activations)
    ? record.activations.map((entry) => ({ ...entry }))
    : [];

  return { ...record, params, activations };
};

export const listNormalizedPromocodeRecords = () => {
  const db = getLocalDatabase();
  return db.select(ADMIN_PROMOCODES_TABLE).map((row) => mapPromocodeRowToRecord(row)).filter(Boolean);
};

export const listCanonicalPromocodeRecords = () =>
  listNormalizedPromocodeRecords().map((record) => clonePromocodeRecord(record)).filter(Boolean);

const tryGetLocalStorage = () => null;

const readFromStorage = () => listCanonicalPromocodeRecords();

const writeToStorage = (records) => {
  const db = getLocalDatabase();
  db.truncate(ADMIN_PROMOCODES_TABLE);

  if (!Array.isArray(records)) {
    return;
  }

  records.forEach((record) => {
    const row = mapPromocodeRecordToRow(clonePromocodeRecord(record));
    if (row) {
      db.upsert(ADMIN_PROMOCODES_TABLE, row);
    }
  });
};

export const storageAdapter = Object.freeze({
  tryGetLocalStorage,
  readFromStorage,
  writeToStorage,
});

export const __internals = Object.freeze({
  cloneDeep,
  normalizeString,
  toNullableNumber,
  toNullablePositiveInt,
  toNonNegativeInt,
  mapActivationRow,
});
