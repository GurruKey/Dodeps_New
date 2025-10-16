import { getLocalDatabase } from '../../database/engine.js';

const PROMOCODES_TABLE = 'admin_promocodes';

const tryGetLocalStorage = () => null;

const clone = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
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

const mapRowToRecord = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const code = normalizeString(row.code, '');
  if (!code) {
    return null;
  }

  const params = row.params && typeof row.params === 'object' ? clone(row.params) : {};
  const activations = Array.isArray(row.activations)
    ? row.activations
        .map((entry) => {
          if (!entry || typeof entry !== 'object') {
            return null;
          }
          const activatedAt =
            entry.activated_at ?? entry.activatedAt ?? entry.created_at ?? entry.createdAt ?? null;
          if (!activatedAt) {
            return null;
          }
          const activation = {
            id: normalizeString(entry.id, null),
            activatedAt,
          };
          const clientId =
            entry.client_id ?? entry.clientId ?? entry.player_id ?? entry.playerId ?? null;
          if (typeof clientId === 'string' && clientId.trim()) {
            activation.clientId = clientId.trim();
          }
          return activation;
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

const mapRecordToRow = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const code = normalizeString(record.code, '');
  if (!code) {
    return null;
  }

  const id = normalizeString(record.id, code) || code;
  const typeId = normalizeString(record.typeId ?? record.type_id, 'generic');
  const params = record.params && typeof record.params === 'object' ? clone(record.params) : {};
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

const readFromStorage = () => {
  const db = getLocalDatabase();
  return db
    .select(PROMOCODES_TABLE)
    .map((row) => mapRowToRecord(row))
    .filter(Boolean)
    .map((record) => ({
      ...record,
      params: record.params ? clone(record.params) : {},
      activations: Array.isArray(record.activations)
        ? record.activations.map((entry) => ({ ...entry }))
        : [],
    }));
};

const writeToStorage = (records) => {
  const db = getLocalDatabase();
  db.truncate(PROMOCODES_TABLE);

  if (!Array.isArray(records)) {
    return;
  }

  records.forEach((record) => {
    const row = mapRecordToRow(record);
    if (row) {
      db.upsert(PROMOCODES_TABLE, row);
    }
  });
};

export const storageAdapter = Object.freeze({
  tryGetLocalStorage,
  readFromStorage,
  writeToStorage,
});
