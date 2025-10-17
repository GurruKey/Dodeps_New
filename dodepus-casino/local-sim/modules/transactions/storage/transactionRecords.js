import { getLocalDatabase } from '../../../database/index.js';
import { DEFAULT_TRANSACTION_CURRENCY, PROFILE_TRANSACTIONS_TABLE } from '../constants.js';

const safeClone = (value) => {
  if (value == null) {
    return value;
  }

  try {
    return structuredClone(value);
  } catch {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  }
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

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

const toFiniteNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toIsoDateTime = (value) => {
  if (!value) {
    return null;
  }

  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  } catch {
    return null;
  }
};

const normalizeCurrency = (value) => {
  const text = toTrimmedString(value, DEFAULT_TRANSACTION_CURRENCY);
  return text ? text.toUpperCase() : DEFAULT_TRANSACTION_CURRENCY;
};

const normalizeType = (value) => {
  const text = toTrimmedString(value, '').toLowerCase();
  if (text === 'deposit') return 'deposit';
  if (text === 'withdraw') return 'withdraw';
  if (text === 'bonus') return 'bonus';
  return text || 'other';
};

const normalizeStatus = (value) => {
  const text = toTrimmedString(value, '').toLowerCase();
  if (text === 'pending') return 'pending';
  if (text === 'failed') return 'failed';
  return 'success';
};

const normalizeMethod = (value) => {
  const text = toTrimmedString(value, '');
  return text || 'other';
};

const resolveRecordId = (row, userId) => {
  const id = toTrimmedString(row.id, '');
  if (id) {
    return id;
  }

  const createdAt =
    row.created_at ?? row.createdAt ?? row.date ?? row.timestamp ?? row.updated_at ?? row.updatedAt;
  const fallback = toTrimmedString(createdAt, '') || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `${userId}:${fallback}`;
};

const freezeRecord = (record) => {
  const raw = record?.raw && typeof record.raw === 'object' ? Object.freeze({ ...record.raw }) : record?.raw ?? null;
  return Object.freeze({ ...record, raw });
};

const freezeRecords = (records) => Object.freeze(records.map((record) => freezeRecord(record)));

const compareByCreatedAtDesc = (a, b) => {
  const timeA = a.createdAt ? Date.parse(a.createdAt) : 0;
  const timeB = b.createdAt ? Date.parse(b.createdAt) : 0;
  return timeB - timeA;
};

export const mapTransactionRowToRecord = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const userId = toTrimmedString(row.user_id ?? row.userId, '');
  if (!userId) {
    return null;
  }

  const id = resolveRecordId(row, userId);
  const amount = toFiniteNumber(row.amount, 0);
  const createdAt =
    toIsoDateTime(
      row.created_at ?? row.createdAt ?? row.date ?? row.timestamp ?? row.updated_at ?? row.updatedAt,
    ) ?? null;
  const updatedAt =
    toIsoDateTime(row.updated_at ?? row.updatedAt ?? row.created_at ?? row.createdAt) ?? createdAt;

  return {
    id,
    userId,
    amount,
    currency: normalizeCurrency(row.currency),
    type: normalizeType(row.transaction_type ?? row.type),
    method: normalizeMethod(row.method ?? row.payment_method),
    status: normalizeStatus(row.status ?? row.transaction_status),
    createdAt,
    updatedAt,
    raw: safeClone(row),
  };
};

export const mapTransactionRecordToRow = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const userId = toTrimmedString(record.userId ?? record.user_id, '');
  const id = toTrimmedString(record.id, '');

  if (!userId || !id) {
    return null;
  }

  const amount = toFiniteNumber(record.amount, 0);
  const currency = normalizeCurrency(record.currency ?? DEFAULT_TRANSACTION_CURRENCY);
  const type = normalizeType(record.type ?? record.transaction_type);
  const method = normalizeMethod(record.method ?? record.payment_method);
  const status = normalizeStatus(record.status ?? record.transaction_status);
  const createdAt = toIsoDateTime(
    record.createdAt ?? record.created_at ?? record.date ?? record.timestamp ?? record.updatedAt,
  );
  const updatedAt = toIsoDateTime(record.updatedAt ?? record.updated_at ?? createdAt);

  return {
    id,
    user_id: userId,
    amount,
    currency,
    transaction_type: type,
    method,
    status,
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

export const readTransactionRecords = () => {
  const db = getLocalDatabase();
  const records = db
    .select(PROFILE_TRANSACTIONS_TABLE)
    .map((row) => mapTransactionRowToRecord(row))
    .filter(Boolean)
    .sort(compareByCreatedAtDesc);

  return freezeRecords(records);
};

export const getTransactionSnapshot = () => {
  const records = readTransactionRecords();
  const byId = new Map();
  const byUserId = new Map();

  records.forEach((record) => {
    byId.set(record.id, record);
    if (!byUserId.has(record.userId)) {
      byUserId.set(record.userId, []);
    }
    byUserId.get(record.userId).push(record);
  });

  Array.from(byUserId.entries()).forEach(([userId, list]) => {
    const sorted = list.slice().sort(compareByCreatedAtDesc);
    byUserId.set(userId, Object.freeze(sorted));
  });

  return Object.freeze({
    records,
    byId,
    byUserId,
  });
};

export const listTransactionRecords = () => readTransactionRecords().map((record) => ({ ...record }));

export const writeTransactionRecords = (records) => {
  const db = getLocalDatabase();
  const rows = ensureArray(records)
    .map((record) => mapTransactionRecordToRow(record))
    .filter(Boolean);

  db.replaceWhere(PROFILE_TRANSACTIONS_TABLE, () => true, rows);
  return readTransactionRecords();
};

export const appendTransactionRecord = (record) => {
  const db = getLocalDatabase();
  const row = mapTransactionRecordToRow(record);
  if (!row) {
    return null;
  }

  db.insert(PROFILE_TRANSACTIONS_TABLE, row);
  const inserted = mapTransactionRowToRecord(row);
  return inserted ? freezeRecord(inserted) : null;
};

export const __internals = Object.freeze({
  safeClone,
  ensureArray,
  toTrimmedString,
  toFiniteNumber,
  toIsoDateTime,
  normalizeCurrency,
  normalizeType,
  normalizeStatus,
  normalizeMethod,
  resolveRecordId,
  compareByCreatedAtDesc,
});
