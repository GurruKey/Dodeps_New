import { getLocalDatabase } from '../../database/engine.js';
import {
  ADMIN_LOGS_TABLE,
  DEFAULT_ADMIN_ACTION,
  DEFAULT_ADMIN_ROLE,
  DEFAULT_ADMIN_SECTION,
} from './constants.js';

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

const toOptionalString = (value) => {
  const text = toTrimmedString(value, '');
  return text || undefined;
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

const normalizeRole = (value) => {
  const role = toTrimmedString(value, DEFAULT_ADMIN_ROLE).toLowerCase();
  return role || DEFAULT_ADMIN_ROLE;
};

const normalizeSection = (value) => {
  const section = toTrimmedString(value, DEFAULT_ADMIN_SECTION).toLowerCase();
  return section || DEFAULT_ADMIN_SECTION;
};

const resolveAction = (value) => {
  const action = toTrimmedString(value, '');
  return action || DEFAULT_ADMIN_ACTION;
};

const freezeRecord = (record) => {
  if (!record) {
    return record;
  }

  const raw = record.raw && typeof record.raw === 'object' ? Object.freeze({ ...record.raw }) : record.raw ?? null;
  return Object.freeze({ ...record, raw });
};

const freezeRecords = (records) => Object.freeze(records.map((record) => freezeRecord(record)));

const compareByCreatedAtDesc = (a, b) => {
  const timestampA = a?.createdAt ? Date.parse(a.createdAt) : 0;
  const timestampB = b?.createdAt ? Date.parse(b.createdAt) : 0;
  return timestampB - timestampA;
};

export const mapAdminLogRowToRecord = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toTrimmedString(row.id, '');
  if (!id) {
    return null;
  }

  const adminId = toTrimmedString(row.admin_id ?? row.adminId, 'UNKNOWN') || 'UNKNOWN';
  const adminName = toTrimmedString(row.admin_name ?? row.adminName, 'Неизвестный админ') || 'Неизвестный админ';
  const role = normalizeRole(row.role);
  const section = normalizeSection(row.section);
  const action = resolveAction(row.action);
  const createdAt = toIsoDateTime(row.created_at ?? row.createdAt ?? row.timestamp);
  const context = toOptionalString(row.context ?? row.details);
  const metadata = row.metadata && typeof row.metadata === 'object' ? safeClone(row.metadata) : undefined;

  const record = {
    id,
    adminId,
    adminName,
    role,
    section,
    action,
    createdAt,
    raw: safeClone(row),
  };

  if (context) {
    record.context = context;
  }

  if (metadata) {
    record.metadata = metadata;
  }

  return record;
};

export const mapAdminLogRecordToRow = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const id = toTrimmedString(record.id, '');
  if (!id) {
    return null;
  }

  const adminId = toTrimmedString(record.adminId ?? record.admin_id, '');
  const adminName = toTrimmedString(record.adminName ?? record.admin_name, '');
  const role = normalizeRole(record.role ?? record.admin_role);
  const section = normalizeSection(record.section ?? record.admin_section);
  const action = resolveAction(record.action ?? record.admin_action);
  const createdAt = toIsoDateTime(record.createdAt ?? record.created_at ?? record.timestamp);
  const metadata = record.metadata && typeof record.metadata === 'object' ? safeClone(record.metadata) : undefined;
  const context = toOptionalString(record.context ?? record.details);

  if (!adminId || !adminName) {
    return null;
  }

  const row = {
    id,
    admin_id: adminId,
    admin_name: adminName,
    role,
    section,
    action,
    created_at: createdAt,
  };

  if (context) {
    row.context = context;
  }

  if (metadata) {
    row.metadata = metadata;
  }

  return row;
};

export const readAdminLogRecords = () => {
  const db = getLocalDatabase();
  const rows = db.select(ADMIN_LOGS_TABLE);
  const records = rows.map((row) => mapAdminLogRowToRecord(row)).filter(Boolean).sort(compareByCreatedAtDesc);
  return freezeRecords(records);
};

export const getAdminLogSnapshot = () => {
  const records = readAdminLogRecords();
  const byId = new Map();
  const byAdminId = new Map();
  const bySection = new Map();

  records.forEach((record) => {
    byId.set(record.id, record);

    if (!byAdminId.has(record.adminId)) {
      byAdminId.set(record.adminId, []);
    }
    byAdminId.get(record.adminId).push(record);

    if (!bySection.has(record.section)) {
      bySection.set(record.section, []);
    }
    bySection.get(record.section).push(record);
  });

  Array.from(byAdminId.entries()).forEach(([adminId, list]) => {
    const sorted = list.slice().sort(compareByCreatedAtDesc);
    byAdminId.set(adminId, Object.freeze(sorted));
  });

  Array.from(bySection.entries()).forEach(([section, list]) => {
    const sorted = list.slice().sort(compareByCreatedAtDesc);
    bySection.set(section, Object.freeze(sorted));
  });

  return Object.freeze({
    records,
    byId,
    byAdminId,
    bySection,
  });
};

export const listAdminLogRecords = () => readAdminLogRecords().map((record) => ({ ...record }));

export const writeAdminLogRecords = (records) => {
  const db = getLocalDatabase();
  const normalized = Array.isArray(records) ? records : [];
  const rows = normalized.map((record) => mapAdminLogRecordToRow(record)).filter(Boolean);
  db.replaceWhere(ADMIN_LOGS_TABLE, () => true, rows);
  return readAdminLogRecords();
};

export const appendAdminLogRecord = (record) => {
  const db = getLocalDatabase();
  const row = mapAdminLogRecordToRow(record);
  if (!row) {
    return null;
  }

  db.insert(ADMIN_LOGS_TABLE, row);
  const inserted = mapAdminLogRowToRecord(row);
  return inserted ? freezeRecord(inserted) : null;
};

export const __internals = Object.freeze({
  safeClone,
  toTrimmedString,
  toOptionalString,
  toIsoDateTime,
  normalizeRole,
  normalizeSection,
  resolveAction,
  compareByCreatedAtDesc,
  freezeRecord,
});
