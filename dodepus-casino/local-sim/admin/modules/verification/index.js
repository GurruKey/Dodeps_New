import { readAdminClients } from '../clients/index.js';
import { appendAdminLog } from './logs.js';
import {
  normalizeString,
  normalizeStatus,
  normalizeBooleanMap,
  normalizeFieldsPatch,
  mergeFieldStates,
  normalizeNotes,
} from '../../../logic/verificationHelpers.js';
import {
  readVerificationSnapshot,
  updateVerificationSnapshot,
} from '../../../tables/verification.js';

export const ADMIN_VERIFICATION_EVENT = 'dodepus:admin-verification-change';

const VALID_STATUSES = Object.freeze(['idle', 'pending', 'rejected', 'approved']);

const GENDER_MALE_VALUES = Object.freeze([
  'male',
  'm',
  'man',
  'м',
  'м.',
  'муж',
  'муж.',
  'мужчина',
  'мужской',
]);

const GENDER_FEMALE_VALUES = Object.freeze([
  'female',
  'f',
  'woman',
  'ж',
  'ж.',
  'жен',
  'жен.',
  'женщина',
  'женский',
]);

const GENDER_CLEAR_VALUES = Object.freeze([
  '',
  'unspecified',
  'не указан',
  'не указано',
  'не выбрано',
  'не выбран',
  'не выбрана',
  'unknown',
  'другое',
  'other',
]);

const normalizeGenderValue = (value) => {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) {
    return '';
  }

  if (GENDER_MALE_VALUES.includes(normalized)) {
    return 'male';
  }

  if (GENDER_FEMALE_VALUES.includes(normalized)) {
    return 'female';
  }

  if (GENDER_CLEAR_VALUES.includes(normalized)) {
    return '';
  }

  return '';
};

const normalizeProfilePatch = (patch = {}) => {
  if (!patch || typeof patch !== 'object') {
    return {};
  }

  const normalized = {};

  if ('address' in patch) {
    normalized.address = normalizeString(patch.address);
  }

  if ('city' in patch) {
    normalized.city = normalizeString(patch.city);
  }

  if ('country' in patch) {
    normalized.country = normalizeString(patch.country);
  }

  if ('firstName' in patch) {
    normalized.firstName = normalizeString(patch.firstName);
  }

  if ('lastName' in patch) {
    normalized.lastName = normalizeString(patch.lastName);
  }

  if ('dob' in patch) {
    const normalizedDob = normalizeString(patch.dob);
    normalized.dob = normalizedDob || null;
  }

  if ('gender' in patch) {
    const normalizedInput = normalizeString(patch.gender);
    const normalizedGender = normalizeGenderValue(normalizedInput);

    if (normalizedGender) {
      normalized.gender = normalizedGender;
    } else if (!normalizedInput || GENDER_CLEAR_VALUES.includes(normalizedInput.toLowerCase())) {
      normalized.gender = '';
    }
  }

  return normalized;
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

const buildProfileSnapshot = (client, extras) => {
  const source = extras && typeof extras === 'object' ? extras : client?.profile;

  return {
    email: normalizeString(client?.email),
    phone: normalizeString(client?.phone),
    address: normalizeString(source?.address),
    city: normalizeString(source?.city),
    country: normalizeString(source?.country),
    firstName: normalizeString(source?.firstName),
    lastName: normalizeString(source?.lastName),
    dob: normalizeString(source?.dob),
    gender: normalizeGenderValue(source?.gender ?? source?.sex ?? ''),
  };
};

const createHistoryEntry = ({
  request,
  reviewer,
  status,
  notes,
  completedFields,
  requestedFields,
  clearedFields,
}) => {
  const timestamp = new Date().toISOString();
  return {
    id: `vrh_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    requestId: normalizeString(request?.id),
    status: normalizeStatus(status),
    reviewer: {
      id: normalizeString(reviewer?.id),
      name: normalizeString(reviewer?.name),
      role: normalizeString(reviewer?.role),
    },
    notes: normalizeNotes(notes),
    updatedAt: timestamp,
    completedFields: normalizeBooleanMap(completedFields),
    requestedFields: normalizeBooleanMap(requestedFields ?? completedFields),
    clearedFields: normalizeBooleanMap(clearedFields),
  };
};

const sanitizeHistoryEntries = (history, fallbackRequest) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const status = normalizeStatus(entry.status ?? fallbackRequest?.status);
      const normalizedCompleted = normalizeBooleanMap(
        entry.completedFields ?? fallbackRequest?.completedFields,
      );
      const normalizedRequested = normalizeBooleanMap(
        entry.requestedFields ?? entry.completedFields ?? fallbackRequest?.requestedFields,
      );

      const updatedAt = normalizeString(entry.updatedAt) || fallbackRequest?.updatedAt;

      return {
        id: normalizeString(entry.id) || `vrh_${Math.random().toString(36).slice(2, 8)}`,
        requestId: normalizeString(entry.requestId ?? fallbackRequest?.id),
        status,
        reviewer: {
          id: normalizeString(entry.reviewer?.id),
          name: normalizeString(entry.reviewer?.name),
          role: normalizeString(entry.reviewer?.role),
        },
        notes: normalizeNotes(entry.notes),
        updatedAt: updatedAt || new Date().toISOString(),
        completedFields: normalizedCompleted,
        requestedFields: normalizedRequested,
        clearedFields: normalizeBooleanMap(entry.clearedFields),
      };
    })
    .filter(Boolean);
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

  const completedFields = normalizeBooleanMap(request.completedFields);
  const requestedFields = normalizeBooleanMap(request.requestedFields ?? request.completedFields);
  const requestedCount = Object.values(requestedFields).filter(Boolean).length;
  const calculatedCompleted = Object.values(completedFields).filter(Boolean).length;
  const baseTotal = Math.max(requestedCount, calculatedCompleted);
  const totalFields = clamp(baseTotal || Object.keys(requestedFields).length || 4, 1, 10);
  const completedCount = clamp(calculatedCompleted, 0, totalFields);

  const submittedAt = normalizeString(
    request.submittedAt || request.createdAt || request.updatedAt || '',
    '',
  );
  const updatedAt = normalizeString(request.updatedAt || submittedAt, submittedAt);
  const reviewedAt = normalizeString(request.reviewedAt || updatedAt, updatedAt);

  const attachments = Array.isArray(client?.profile?.verificationUploads)
    ? client.profile.verificationUploads.map((upload) => clone(upload))
    : [];

  const profile = buildProfileSnapshot(client, client?.profile);
  const history = sanitizeHistoryEntries(request.history, request);

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
    profile,
    history,
    reviewer: {
      id: normalizeString(request.reviewerId),
      name: normalizeString(request.reviewerName),
      role: normalizeString(request.reviewerRole),
    },
    notes: normalizeNotes(request.notes),
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

export const updateVerificationRequestStatus = ({
  requestId,
  status,
  reviewer,
  notes,
  completedFields,
  requestedFields,
  profilePatch,
} = {}) => {
  const normalizedStatus = ensureValidStatus(status);
  const owner = findRequestOwner(requestId);
  if (!owner) {
    throw new Error('Запрос верификации не найден');
  }

  const snapshot = readVerificationSnapshot(owner.id);
  const extras = snapshot.extras;
  const requests = Array.isArray(snapshot.requests) ? snapshot.requests.slice() : [];
  const index = requests.findIndex((request) => request?.id === requestId);
  if (index < 0) {
    throw new Error('Не удалось обновить запрос верификации');
  }

  const reviewerInfo = buildReviewerInfo(reviewer);
  const nowIso = new Date().toISOString();

  const previous = requests[index] || {};
  const normalizedCompleted = normalizeBooleanMap(previous.completedFields);
  const normalizedRequested = normalizeBooleanMap(previous.requestedFields ?? previous.completedFields);

  const mergedCompleted = mergeFieldStates(normalizedCompleted, completedFields);
  const mergedRequested = mergeFieldStates(normalizedRequested, requestedFields);

  const nextCompleted = mergedCompleted;
  const nextRequested = mergeFieldStates(mergedRequested, mergedCompleted);

  const completedTrueCount = Object.values(nextCompleted).filter(Boolean).length;
  const requestedTrueCount = Object.values(nextRequested).filter(Boolean).length;
  const relevantTotal = Math.max(
    requestedTrueCount,
    completedTrueCount,
    Object.keys(nextCompleted).length,
    Object.keys(nextRequested).length,
  );

  const totalFields = clamp(relevantTotal || Object.keys(nextRequested).length || 4, 1, 10);
  const completedCount = clamp(completedTrueCount, 0, totalFields);
  const hasOutstanding = requestedTrueCount > completedTrueCount;
  const finalStatus =
    normalizedStatus === 'rejected'
      ? 'rejected'
      : hasOutstanding
        ? 'pending'
        : 'approved';

  const normalizedNotes = normalizeNotes(notes);
  const previousHistory = sanitizeHistoryEntries(previous.history, previous);
  const historyEntry = createHistoryEntry({
    request: previous,
    reviewer: reviewerInfo,
    status: finalStatus,
    notes: normalizedNotes,
    completedFields: nextCompleted,
    requestedFields: nextRequested,
    clearedFields: previous.clearedFields,
  });

  const nextHistory = [historyEntry, ...previousHistory];

  const updatedRequest = {
    ...previous,
    status: finalStatus,
    reviewerId: reviewerInfo.id,
    reviewerName: reviewerInfo.name,
    reviewerRole: reviewerInfo.role,
    reviewedAt: nowIso,
    updatedAt: nowIso,
    completedFields: nextCompleted,
    requestedFields: nextRequested,
    completedCount,
    totalFields,
    notes: normalizedNotes,
    history: nextHistory,
  };

  const nextRequests = requests.slice();
  nextRequests[index] = updatedRequest;

  const normalizedProfilePatch = normalizeProfilePatch(profilePatch);

  updateVerificationSnapshot(owner.id, () => ({
    extras: {
      ...extras,
      ...normalizedProfilePatch,
    },
    requests: nextRequests,
  }));

  try {
    notifyAdminVerificationRequestsChanged({
      type: 'updated',
      requestId,
      userId: owner.id,
      status: finalStatus,
    });
  } catch (error) {
    console.warn('Failed to broadcast admin verification status change', error);
  }

  try {
    const contextStatus =
      finalStatus === 'approved' ? 'approved' : finalStatus === 'rejected' ? 'rejected' : 'pending';
    const actionLabel = (() => {
      switch (contextStatus) {
        case 'approved':
          return `Подтвердил запрос верификации #${requestId}`;
        case 'rejected':
          return `Отклонил запрос верификации #${requestId}`;
        default:
          return `Обновил запрос верификации #${requestId}`;
      }
    })();

    appendAdminLog({
      section: 'verification',
      action: actionLabel,
      adminId: reviewerInfo.id,
      adminName: reviewerInfo.name,
      role: reviewerInfo.role,
      context: `verification:${contextStatus}:${requestId}`,
      metadata: {
        requestId,
        userId: owner.id,
        status: finalStatus,
        completedFields: nextCompleted,
        requestedFields: nextRequested,
      },
    });
  } catch (error) {
    console.warn('Не удалось записать лог действия верификации', error);
  }

  const clientForEntry = {
    ...owner,
    profile: {
      ...owner.profile,
      ...extras,
      ...normalizedProfilePatch,
      verificationRequests: nextRequests,
    },
  };

  return buildRequestEntry(clientForEntry, updatedRequest);
};

const buildClearedSelection = (modules = {}) => {
  const normalized = normalizeBooleanMap(modules);
  const result = {};
  Object.keys(normalized).forEach((key) => {
    if (!normalized[key]) {
      return;
    }
    result[key] = true;
  });
  return normalizeBooleanMap(result);
};

export const resetVerificationRequestModules = ({
  requestId,
  modules,
  reviewer,
  notes,
} = {}) => {
  const clearedMap = buildClearedSelection(modules);
  const clearedKeys = Object.keys(clearedMap).filter((key) => clearedMap[key]);

  if (!clearedKeys.length) {
    throw new Error('Выберите хотя бы один модуль для сброса');
  }

  const owner = findRequestOwner(requestId);
  if (!owner) {
    throw new Error('Запрос верификации не найден');
  }

  const snapshot = readVerificationSnapshot(owner.id);
  const extras = snapshot.extras;
  const requests = Array.isArray(snapshot.requests) ? snapshot.requests.slice() : [];

  const index = requests.findIndex((entry) => entry?.id === requestId);
  if (index === -1) {
    throw new Error('Запрос верификации не найден');
  }

  const previous = requests[index];
  const reviewerInfo = buildReviewerInfo(reviewer);
  const normalizedCompleted = normalizeBooleanMap(previous.completedFields);
  const normalizedRequested = normalizeBooleanMap(previous.requestedFields ?? previous.completedFields);

  clearedKeys.forEach((key) => {
    normalizedCompleted[key] = false;
    normalizedRequested[key] = false;
  });

  const completedTrueCount = Object.values(normalizedCompleted).filter(Boolean).length;
  const requestedTrueCount = Object.values(normalizedRequested).filter(Boolean).length;
  const relevantTotal = Math.max(
    requestedTrueCount,
    completedTrueCount,
    Object.keys(normalizedCompleted).length,
    Object.keys(normalizedRequested).length,
  );

  const totalFields = clamp(relevantTotal || Object.keys(normalizedRequested).length || 4, 1, 10);
  const completedCount = clamp(completedTrueCount, 0, totalFields);
  const normalizedNotes = normalizeNotes(notes);
  const nowIso = new Date().toISOString();

  const historyEntry = createHistoryEntry({
    request: previous,
    reviewer: reviewerInfo,
    status: 'reset',
    notes: normalizedNotes,
    completedFields: normalizedCompleted,
    requestedFields: normalizedRequested,
    clearedFields: clearedMap,
  });

  const previousHistory = sanitizeHistoryEntries(previous.history, previous);
  const nextHistory = [historyEntry, ...previousHistory];

  const nextRequest = {
    ...previous,
    status: completedTrueCount > 0 ? 'approved' : 'idle',
    reviewerId: reviewerInfo.id,
    reviewerName: reviewerInfo.name,
    reviewerRole: reviewerInfo.role,
    reviewedAt: nowIso,
    updatedAt: nowIso,
    completedFields: normalizedCompleted,
    requestedFields: normalizedRequested,
    completedCount,
    totalFields,
    notes: normalizedNotes,
    history: nextHistory,
  };

  requests[index] = nextRequest;

  updateVerificationSnapshot(owner.id, () => ({
    extras,
    requests,
  }));

  try {
    notifyAdminVerificationRequestsChanged({
      type: 'reset',
      requestId,
      userId: owner.id,
    });
  } catch (error) {
    console.warn('Failed to broadcast admin verification reset', error);
  }

  try {
    appendAdminLog({
      section: 'verification',
      action: `Сбросил статусы модулей для запроса #${requestId}`,
      adminId: reviewerInfo.id,
      adminName: reviewerInfo.name,
      role: reviewerInfo.role,
      context: `verification:reset:${requestId}`,
      metadata: {
        requestId,
        userId: owner.id,
        clearedFields: clearedMap,
      },
    });
  } catch (error) {
    console.warn('Не удалось записать лог сброса верификации', error);
  }

  const clientForEntry = {
    ...owner,
    profile: {
      ...owner.profile,
      ...extras,
      verificationRequests: requests,
    },
  };

  return buildRequestEntry(clientForEntry, nextRequest);
};

export const __internals = Object.freeze({
  normalizeStatus,
  normalizeBooleanMap,
  parseTimestamp,
  buildRequestEntry,
  findRequestOwner,
  ensureValidStatus,
});
