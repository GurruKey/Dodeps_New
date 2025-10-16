import { getLocalDatabase } from '../../database/engine.js';

const normalizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  return trimmed;
};

const normalizeStatus = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) {
    return 'idle';
  }
  if (['pending', 'idle', 'approved', 'rejected'].includes(normalized)) {
    return normalized;
  }
  return 'idle';
};

const normalizePriority = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) {
    return 'normal';
  }
  if (['low', 'normal', 'high'].includes(normalized)) {
    return normalized;
  }
  return 'normal';
};

const formatSubmittedAt = (value) => {
  if (!value) {
    return '';
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return typeof value === 'string' ? value : '';
    }

    const formatter = new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return formatter.format(date).replace(',', '');
  } catch {
    return typeof value === 'string' ? value : '';
  }
};

const cloneQueueItem = (item) => JSON.parse(JSON.stringify(item));

const mapQueueRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = normalizeText(row.id);
  if (!id) {
    return null;
  }

  const userId = normalizeText(row.user_id ?? row.userId);
  const documentType =
    normalizeText(row.document_type ?? row.documentType) || 'Документ';
  const submittedAtRaw = row.submitted_at ?? row.submittedAt ?? null;

  return {
    id,
    requestId: normalizeText(row.request_id ?? row.requestId),
    userId: userId || 'unknown',
    documentType,
    status: normalizeStatus(row.status),
    priority: normalizePriority(row.priority),
    submittedAt: formatSubmittedAt(submittedAtRaw),
  };
};

const readQueueSnapshot = () => {
  const db = getLocalDatabase();
  const rows = db.select('verification_queue');

  return rows
    .map(mapQueueRow)
    .filter(Boolean)
    .map((item) => Object.freeze({ ...item }));
};

export const listAdminVerificationQueue = () => readQueueSnapshot().map(cloneQueueItem);

export const verificationQueue = Object.freeze(readQueueSnapshot());

export const __internals = Object.freeze({ readQueueSnapshot, mapQueueRow });
