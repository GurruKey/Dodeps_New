import { readAdminClients } from './clients';
import { loadExtras, saveExtras } from '../auth/profileExtras';

export const ADMIN_VERIFICATION_EVENT = 'dodepus:admin-verification-change';

const VALID_STATUSES = Object.freeze(['pending', 'partial', 'rejected', 'approved']);

const normalizeString = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const normalizeStatus = (value) => {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) return 'pending';
  if (normalized === 'approved' || normalized === 'verified' || normalized === 'done') {
    return 'approved';
  }
  if (normalized === 'rejected' || normalized === 'declined' || normalized === 'denied') {
    return 'rejected';
  }
  if (normalized === 'partial' || normalized === 'inreview' || normalized === 'in_review') {
    return 'partial';
  }
  if (normalized === 'waiting' || normalized === 'new' || normalized === 'requested') {
    return 'pending';
  }
  if (VALID_STATUSES.includes(normalized)) {
    return normalized;
  }
  return 'pending';
};

const normalizeFields = (fields = {}) => ({
  email: Boolean(fields?.email),
  phone: Boolean(fields?.phone),
  address: Boolean(fields?.address),
  doc: Boolean(fields?.doc),
});

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseTimestamp = (value) => {
  if (!value) return null;
  try {
    const time = Date.parse(value);
    if (!Number.isFinite(time)) return null;
    return time;
  } catch {
    return null;
  }
};

const clone = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const getEventTarget = () => {
  if (typeof window !== 'undefined') return window;
  if (typeof globalThis !== 'undefined' && globalThis?.addEventListener) {
    return globalThis;
  }
  return null;
};

const emitVerificationChange = (detail) => {
  const target = getEventTarget();
  if (!target?.dispatchEvent || typeof CustomEvent !== 'function') return;

  try {
    target.dispatchEvent(new CustomEvent(ADMIN_VERIFICATION_EVENT, { detail: detail ?? null }));
  } catch (error) {
    console.warn('Failed to emit admin verification change event', error);
  }
};

export const notifyAdminVerificationRequestsChanged = (detail) => emitVerificationChange(detail);

const buildRequestEntry = (client, request) => {
  if (!client || !request || typeof request !== 'object') return null;

  const id = normalizeString(request.id);
  if (!id) return null;

  const completedFields = normalizeFields(request.completedFields);
  const requestedFields = normalizeFields(request.requestedFields ?? request.completedFields);
  const totalFields = clamp(
    toNumber(request.totalFields, Object.keys(requestedFields).length || 4),
    1,
    10,
  );
  const calculatedCompleted = Object.values(completedFields).filter(Boolean).length;
  const completedCount = clamp(toNumber(request.completedCount, calculatedCompleted), 0, totalFields);

  const submittedAt = normalizeString(
    request.submittedAt || request.createdAt || request.updatedAt || '',
    '',
  );
  const updatedAt = normalizeString(request.updatedAt || submittedAt, submittedAt);
  const reviewedAt = normalizeString(request.reviewedAt || updatedAt, updatedAt);

  const attachments = Array.isArray(client?.profile?.verificationUploads)
    ? client.profile.verificationUploads.map((upload) => clone(upload))
    : [];

  return {
    id,
    requestId: id,
    userId: normalizeString(client.id, 'UNKNOWN'),
    userEmail: normalizeString(client.email),
    userPhone: normalizeString(client.phone),
    userNickname: normalizeString(client?.profile?.nickname),
    status: normalizeStatus(request.status),
    submittedAt,
    updatedAt,
    reviewedAt,
    completedFields: { ...completedFields },
    requestedFields: { ...requestedFields },
    completedCount,
    totalFields,
    attachments,
    reviewer: {
      id: normalizeString(request.reviewerId),
      name: normalizeString(request.reviewerName),
      role: normalizeString(request.reviewerRole),
    },
    notes: normalizeString(request.notes),
    metadata: request.metadata && typeof request.metadata === 'object' ? clone(request.metadata) : undefined,
    sortTimestamp: parseTimestamp(updatedAt) ?? parseTimestamp(submittedAt) ?? 0,
  };
};

export const readAdminVerificationRequests = () => {
  const clients = readAdminClients();
  const entries = [];

  clients.forEach((client) => {
    const requests = Array.isArray(client?.profile?.verificationRequests)
      ? client.profile.verificationRequests
      : [];

    requests.forEach((request) => {
      const entry = buildRequestEntry(client, request);
      if (entry) {
        entries.push(entry);
      }
    });
  });

  entries.sort((a, b) => (b.sortTimestamp || 0) - (a.sortTimestamp || 0));
  return entries;
};

const createAbortError = (reason) => {
  if (reason instanceof Error) return reason;
  if (typeof DOMException === 'function') {
    return new DOMException('Aborted', 'AbortError');
  }
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
};

export function listAdminVerificationRequests({ signal, delay = 200 } = {}) {
  if (signal?.aborted) {
    return Promise.reject(createAbortError(signal.reason));
  }

  return new Promise((resolve, reject) => {
    const timeout = Math.max(0, delay);

    const complete = () => {
      try {
        const requests = readAdminVerificationRequests().map((entry) => ({ ...entry }));
        resolve(requests);
      } catch (error) {
        reject(error);
      }
    };

    if (!timeout) {
      complete();
      return;
    }

    const timer = setTimeout(complete, timeout);

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

export const subscribeToAdminVerificationRequests = (callback) => {
  const target = getEventTarget();
  if (!target?.addEventListener || typeof callback !== 'function') {
    return () => {};
  }

  const handler = (event) => {
    try {
      callback(event?.detail ?? null);
    } catch (error) {
      console.warn('Failed to handle admin verification subscription callback', error);
    }
  };

  target.addEventListener(ADMIN_VERIFICATION_EVENT, handler);
  return () => {
    target.removeEventListener(ADMIN_VERIFICATION_EVENT, handler);
  };
};

const findRequestOwner = (requestId) => {
  if (!requestId) return null;
  const clients = readAdminClients();
  return (
    clients.find((client) =>
      Array.isArray(client?.profile?.verificationRequests) &&
      client.profile.verificationRequests.some((request) => request?.id === requestId),
    ) || null
  );
};

const buildReviewerInfo = (reviewer = {}) => {
  const id =
    normalizeString(reviewer.id) ||
    normalizeString(reviewer.adminId) ||
    normalizeString(reviewer.userId);

  const name =
    normalizeString(reviewer.name) ||
    normalizeString(reviewer.adminName) ||
    normalizeString(reviewer.fullName);

  const role =
    normalizeString(reviewer.role) ||
    normalizeString(reviewer.adminRole) ||
    normalizeString(reviewer.position);

  return { id, name, role };
};

const ensureValidStatus = (status) => {
  const normalized = normalizeStatus(status);
  if (!VALID_STATUSES.includes(normalized)) {
    throw new Error('Некорректный статус верификации');
  }
  return normalized;
};

export const updateVerificationRequestStatus = ({ requestId, status, reviewer } = {}) => {
  const normalizedStatus = ensureValidStatus(status);
  const owner = findRequestOwner(requestId);
  if (!owner) {
    throw new Error('Запрос верификации не найден');
  }

  const extras = loadExtras(owner.id);
  const requests = Array.isArray(extras.verificationRequests)
    ? extras.verificationRequests.slice()
    : [];
  const index = requests.findIndex((request) => request?.id === requestId);
  if (index < 0) {
    throw new Error('Не удалось обновить запрос верификации');
  }

  const reviewerInfo = buildReviewerInfo(reviewer);
  const nowIso = new Date().toISOString();

  const previous = requests[index] || {};
  const normalizedCompleted = normalizeFields(previous.completedFields);
  const normalizedRequested = normalizeFields(previous.requestedFields ?? previous.completedFields);

  let nextCompleted = { ...normalizedCompleted };
  let nextRequested = { ...normalizedRequested };

  if (normalizedStatus === 'approved' || normalizedStatus === 'partial') {
    nextCompleted = {
      ...normalizedCompleted,
      ...normalizedRequested,
    };
    nextRequested = { ...nextCompleted };
  }

  const completedCount = Object.values(nextCompleted).filter(Boolean).length;
  const totalFields = clamp(
    toNumber(previous.totalFields, Object.keys(nextRequested).length || 4),
    1,
    10,
  );

  const updatedRequest = {
    ...previous,
    status: normalizedStatus,
    reviewerId: reviewerInfo.id,
    reviewerName: reviewerInfo.name,
    reviewerRole: reviewerInfo.role,
    reviewedAt: nowIso,
    updatedAt: nowIso,
    completedFields: nextCompleted,
    requestedFields: nextRequested,
    completedCount,
    totalFields,
  };

  const nextRequests = requests.slice();
  nextRequests[index] = updatedRequest;

  const nextExtras = {
    ...extras,
    verificationRequests: nextRequests,
  };

  saveExtras(owner.id, nextExtras);

  try {
    notifyAdminVerificationRequestsChanged({
      type: 'updated',
      requestId,
      userId: owner.id,
      status: normalizedStatus,
    });
  } catch (error) {
    console.warn('Failed to broadcast admin verification status change', error);
  }

  const clientForEntry = {
    ...owner,
    profile: {
      ...owner.profile,
      ...nextExtras,
      verificationRequests: nextRequests,
    },
  };

  return buildRequestEntry(clientForEntry, updatedRequest);
};

export const __internals = Object.freeze({
  normalizeStatus,
  normalizeFields,
  parseTimestamp,
  buildRequestEntry,
  findRequestOwner,
  ensureValidStatus,
});
