import { getLocalDatabase } from '../../shared/localDatabase.js';
import {
  VERIFICATION_QUEUE_TABLE,
  VERIFICATION_REQUESTS_TABLE,
  VERIFICATION_UPLOADS_TABLE,
} from '../constants.js';
import {
  normalizeBooleanMap,
  normalizeNotes,
  normalizeStatus,
  normalizeString,
} from '../helpers.js';

const toStringId = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
};

const safeClone = (value) => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return undefined;
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

const toLowerCaseString = (value, fallback = '') => {
  const text = toTrimmedString(value, '');
  return text ? text.toLowerCase() : fallback;
};

const normalizeQueueStatus = (value) => {
  const normalized = toLowerCaseString(value, 'idle');
  if (['idle', 'pending', 'approved', 'rejected'].includes(normalized)) {
    return normalized;
  }
  return 'idle';
};

const normalizeQueuePriority = (value) => {
  const normalized = toLowerCaseString(value, 'normal');
  if (['low', 'normal', 'high'].includes(normalized)) {
    return normalized;
  }
  return 'normal';
};

const normalizeQueueDocumentType = (value) => toTrimmedString(value, 'document');

const freezeObject = (value) => Object.freeze({ ...value });

const mapVerificationQueueRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toTrimmedString(row.id, '');
  if (!id) {
    return null;
  }

  const requestId = toTrimmedString(row.request_id ?? row.requestId, '') || null;
  const userId = toTrimmedString(row.user_id ?? row.userId, '') || 'unknown';
  const raw = safeClone(row);

  return Object.freeze({
    id,
    requestId,
    userId,
    documentType: normalizeQueueDocumentType(
      row.document_type ?? row.documentType ?? 'document',
    ),
    status: normalizeQueueStatus(row.status),
    priority: normalizeQueuePriority(row.priority),
    submittedAt: row.submitted_at ?? row.submittedAt ?? null,
    ...(raw ? { raw: freezeObject(raw) } : {}),
  });
};

const readVerificationQueueRecords = () => {
  const db = getLocalDatabase();
  const rows = db.select(VERIFICATION_QUEUE_TABLE);
  return rows.map((row) => mapVerificationQueueRow(row)).filter(Boolean);
};

const cloneQueueRecord = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const clone = {
    id: record.id,
    requestId: record.requestId,
    userId: record.userId,
    documentType: record.documentType,
    status: record.status,
    priority: record.priority,
    submittedAt: record.submittedAt,
  };

  if (record.raw) {
    clone.raw = safeClone(record.raw) ?? { ...record.raw };
  }

  return clone;
};

const pushToIndex = (index, key, value) => {
  if (!key) {
    return;
  }
  if (!index.has(key)) {
    index.set(key, []);
  }
  index.get(key).push(value);
};

export const getVerificationQueueSnapshot = () => {
  const records = readVerificationQueueRecords();
  const byId = new Map();
  const byRequestId = new Map();
  const byUserId = new Map();

  records.forEach((record) => {
    byId.set(record.id, record);
    pushToIndex(byRequestId, record.requestId, record);
    pushToIndex(byUserId, record.userId, record);
  });

  return Object.freeze({
    records,
    byId,
    byRequestId,
    byUserId,
  });
};

export const listVerificationQueueRecords = () =>
  readVerificationQueueRecords().map((record) => cloneQueueRecord(record)).filter(Boolean);

export const findVerificationQueueRecordById = (id) => {
  const snapshot = getVerificationQueueSnapshot();
  return snapshot.byId.get(toTrimmedString(id, '')) ?? null;
};

const matchUserRow = (row, userId) => {
  if (!row || !userId) {
    return false;
  }
  const candidate = row.user_id ?? row.userId;
  return candidate === userId;
};

const mapHistoryRow = (entry, fallbackRequestId) => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const id = toStringId(entry.id);
  if (!id) {
    return null;
  }

  const reviewer =
    entry.reviewer && typeof entry.reviewer === 'object' ? entry.reviewer : {};

  return {
    id,
    requestId: toStringId(entry.request_id ?? entry.requestId) || fallbackRequestId,
    status: normalizeStatus(entry.status),
    reviewer: {
      id:
        toStringId(entry.reviewer_id ?? entry.reviewerId ?? reviewer.id) || null,
      name:
        normalizeString(
          entry.reviewer_name ?? entry.reviewerName ?? reviewer.name ?? '',
        ) || '',
      role:
        normalizeString(
          entry.reviewer_role ?? entry.reviewerRole ?? reviewer.role ?? '',
        ) || '',
    },
    notes: normalizeNotes(entry.notes),
    updatedAt: entry.updated_at ?? entry.updatedAt ?? null,
    completedFields: normalizeBooleanMap(
      entry.completed_fields ?? entry.completedFields,
    ),
    requestedFields: normalizeBooleanMap(
      entry.requested_fields ??
        entry.requestedFields ??
        entry.completed_fields ??
        entry.completedFields,
    ),
    clearedFields: normalizeBooleanMap(entry.cleared_fields ?? entry.clearedFields),
  };
};

export const mapVerificationRequestRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toStringId(row.id);
  if (!id) {
    return null;
  }

  const history = Array.isArray(row.history)
    ? row.history.map((entry) => mapHistoryRow(entry, id)).filter(Boolean)
    : [];

  const metadata = safeClone(row.metadata);

  return {
    id,
    userId: row.user_id ?? row.userId ?? null,
    status: normalizeStatus(row.status),
    submittedAt: row.submitted_at ?? row.submittedAt ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
    reviewedAt: row.reviewed_at ?? row.reviewedAt ?? null,
    reviewerId: row.reviewer_id ?? row.reviewerId ?? null,
    reviewerName: normalizeString(row.reviewer_name ?? row.reviewerName),
    reviewerRole: normalizeString(row.reviewer_role ?? row.reviewerRole),
    notes: normalizeNotes(row.notes),
    completedFields: normalizeBooleanMap(row.completed_fields ?? row.completedFields),
    requestedFields: normalizeBooleanMap(
      row.requested_fields ??
        row.requestedFields ??
        row.completed_fields ??
        row.completedFields,
    ),
    clearedFields: normalizeBooleanMap(row.cleared_fields ?? row.clearedFields),
    history,
    ...(metadata ? { metadata } : {}),
  };
};

export const mapVerificationUploadRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toStringId(row.id);
  if (!id) {
    return null;
  }

  return {
    id,
    userId: row.user_id ?? row.userId ?? null,
    requestId: toStringId(row.request_id ?? row.requestId) || null,
    fileName: normalizeString(row.file_name ?? row.fileName),
    fileType: normalizeString(row.file_type ?? row.fileType) || 'document',
    fileUrl: normalizeString(row.file_url ?? row.fileUrl),
    status: normalizeStatus(row.status),
    uploadedAt: row.uploaded_at ?? row.uploadedAt ?? null,
  };
};

const formatHistoryEntry = (entry, requestId) => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const id = toStringId(entry.id);
  if (!id) {
    return null;
  }

  const reviewer =
    entry.reviewer && typeof entry.reviewer === 'object' ? entry.reviewer : {};

  return {
    id,
    request_id: toStringId(entry.requestId ?? entry.request_id) || requestId,
    status: normalizeStatus(entry.status),
    notes: normalizeNotes(entry.notes),
    updated_at: entry.updatedAt ?? entry.updated_at ?? null,
    reviewer_id: toStringId(entry.reviewerId ?? entry.reviewer_id ?? reviewer.id) || null,
    reviewer_name: normalizeString(
      entry.reviewerName ?? entry.reviewer_name ?? reviewer.name ?? '',
    ) || null,
    reviewer_role: normalizeString(
      entry.reviewerRole ?? entry.reviewer_role ?? reviewer.role ?? '',
    ) || null,
    completed_fields: normalizeBooleanMap(
      entry.completedFields ?? entry.completed_fields,
    ),
    requested_fields: normalizeBooleanMap(
      entry.requestedFields ??
        entry.requested_fields ??
        entry.completedFields ??
        entry.completed_fields,
    ),
    cleared_fields: normalizeBooleanMap(entry.clearedFields ?? entry.cleared_fields),
  };
};

const formatVerificationRequest = (request, userId) => {
  if (!request || typeof request !== 'object') {
    return null;
  }

  const id = toStringId(request.id);
  if (!id) {
    return null;
  }

  const completed = normalizeBooleanMap(
    request.completedFields ?? request.completed_fields,
  );
  const requested = normalizeBooleanMap(
    request.requestedFields ??
      request.requested_fields ??
      request.completedFields ??
      request.completed_fields,
  );
  const cleared = normalizeBooleanMap(
    request.clearedFields ?? request.cleared_fields,
  );

  const history = Array.isArray(request.history)
    ? request.history
        .map((entry) => formatHistoryEntry(entry, id))
        .filter(Boolean)
    : [];

  const metadata = safeClone(request.metadata);

  const submittedAt = request.submittedAt ?? request.submitted_at ?? null;
  const updatedAt = request.updatedAt ?? request.updated_at ?? submittedAt;
  const reviewedAt = request.reviewedAt ?? request.reviewed_at ?? null;

  return {
    id,
    user_id: request.userId ?? request.user_id ?? userId,
    status: normalizeStatus(request.status),
    submitted_at: submittedAt,
    updated_at: updatedAt,
    reviewed_at: reviewedAt,
    reviewer_id: toStringId(request.reviewerId ?? request.reviewer_id) || null,
    reviewer_name: normalizeString(
      request.reviewerName ?? request.reviewer_name,
    ) || null,
    reviewer_role: normalizeString(request.reviewerRole ?? request.reviewer_role) || null,
    notes: normalizeNotes(request.notes),
    completed_fields: completed,
    requested_fields: requested,
    cleared_fields: cleared,
    ...(metadata ? { metadata } : {}),
    ...(history.length ? { history } : {}),
  };
};

const formatVerificationUpload = (upload, userId) => {
  if (!upload || typeof upload !== 'object') {
    return null;
  }

  const id = toStringId(upload.id);
  if (!id) {
    return null;
  }

  return {
    id,
    user_id: upload.userId ?? upload.user_id ?? userId,
    request_id: toStringId(upload.requestId ?? upload.request_id) || null,
    file_name: normalizeString(upload.fileName ?? upload.file_name) || null,
    file_type: normalizeString(upload.fileType ?? upload.file_type) || 'document',
    file_url: normalizeString(upload.fileUrl ?? upload.file_url) || null,
    status: normalizeStatus(upload.status),
    uploaded_at: upload.uploadedAt ?? upload.uploaded_at ?? null,
  };
};

export const prepareVerificationRequestRows = (requests, userId) =>
  (Array.isArray(requests) ? requests : [])
    .map((request) => formatVerificationRequest(request, userId))
    .filter(Boolean);

export const prepareVerificationUploadRows = (uploads, userId) =>
  (Array.isArray(uploads) ? uploads : [])
    .map((upload) => formatVerificationUpload(upload, userId))
    .filter(Boolean);

export const readVerificationRequestsDataset = () => {
  const db = getLocalDatabase();
  return db.select(VERIFICATION_REQUESTS_TABLE).map(mapVerificationRequestRow).filter(Boolean);
};

export const readVerificationUploadsDataset = () => {
  const db = getLocalDatabase();
  return db.select(VERIFICATION_UPLOADS_TABLE).map(mapVerificationUploadRow).filter(Boolean);
};

export const readVerificationDataset = () => ({
  requests: readVerificationRequestsDataset(),
  uploads: readVerificationUploadsDataset(),
});

export const readVerificationDatasetByUser = () => {
  const { requests, uploads } = readVerificationDataset();
  const byUser = new Map();

  requests.forEach((request) => {
    if (!request?.userId) {
      return;
    }
    if (!byUser.has(request.userId)) {
      byUser.set(request.userId, { requests: [], uploads: [] });
    }
    byUser.get(request.userId).requests.push({ ...request });
  });

  uploads.forEach((upload) => {
    if (!upload?.userId) {
      return;
    }
    if (!byUser.has(upload.userId)) {
      byUser.set(upload.userId, { requests: [], uploads: [] });
    }
    byUser.get(upload.userId).uploads.push({ ...upload });
  });

  return byUser;
};

export const readVerificationDatasetForUser = (userId) => {
  if (!userId) {
    return { requests: [], uploads: [] };
  }

  const db = getLocalDatabase();
  const requests = db
    .select(VERIFICATION_REQUESTS_TABLE, (row) => matchUserRow(row, userId))
    .map(mapVerificationRequestRow)
    .filter(Boolean);
  const uploads = db
    .select(VERIFICATION_UPLOADS_TABLE, (row) => matchUserRow(row, userId))
    .map(mapVerificationUploadRow)
    .filter(Boolean);

  return {
    requests,
    uploads,
  };
};

export const writeVerificationDatasetForUser = (userId, { requests, uploads } = {}) => {
  if (!userId) {
    throw new Error('userId is required to write verification dataset');
  }

  const db = getLocalDatabase();
  const requestRows = prepareVerificationRequestRows(requests, userId);
  const uploadRows = prepareVerificationUploadRows(uploads, userId);

  db.replaceWhere(VERIFICATION_REQUESTS_TABLE, (row) => matchUserRow(row, userId), requestRows);
  db.replaceWhere(VERIFICATION_UPLOADS_TABLE, (row) => matchUserRow(row, userId), uploadRows);

  return {
    requests: requestRows,
    uploads: uploadRows,
  };
};

export const __internals = Object.freeze({
  toStringId,
  safeClone,
  toTrimmedString,
  toLowerCaseString,
  matchUserRow,
  mapHistoryRow,
  formatHistoryEntry,
  formatVerificationRequest,
  formatVerificationUpload,
  normalizeQueueStatus,
  normalizeQueuePriority,
  mapVerificationQueueRow,
  readVerificationQueueRecords,
  cloneQueueRecord,
});
