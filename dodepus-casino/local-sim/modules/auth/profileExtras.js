import { PROFILE_KEY } from './constants.js';
import { getLocalDatabase } from '../../database/engine.js';
import { normalizeBooleanMap } from '../verification/helpers.js';

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

const normalizeGender = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const normalized = value.trim().toLowerCase();
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

const readLegacyExtras = (uid) => {
  if (!uid) {
    return null;
  }
  try {
    if (typeof globalThis === 'undefined' || !globalThis.localStorage) {
      return null;
    }
    const raw = globalThis.localStorage.getItem(PROFILE_KEY(uid));
    if (!raw) {
      return null;
    }
    return pickExtras(JSON.parse(raw));
  } catch (err) {
    console.warn('Не удалось загрузить профиль из localStorage, будет использовано значение по умолчанию', err);
    return null;
  }
};

const writeLegacyExtras = (uid, extras) => {
  if (!uid) {
    return;
  }
  try {
    if (typeof globalThis === 'undefined' || !globalThis.localStorage) {
      return;
    }
    globalThis.localStorage.setItem(PROFILE_KEY(uid), JSON.stringify(extras));
  } catch (err) {
    console.warn('Не удалось сохранить профиль в localStorage', err);
  }
};

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

const matchUserRow = (row, uid) => {
  if (!row || !uid) {
    return false;
  }
  const candidate = row.userId ?? row.user_id;
  return candidate === uid;
};

const fromVerificationHistoryRow = (entry, requestId) => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const id = toStringId(entry.id);
  if (!id) {
    return null;
  }

  return {
    id,
    requestId: toStringId(entry.request_id ?? entry.requestId) || requestId,
    status: toStringId(entry.status) || 'pending',
    reviewer: {
      id: toStringId(entry.reviewer_id ?? entry.reviewerId ?? entry.reviewer?.id) || null,
      name: toStringId(entry.reviewer_name ?? entry.reviewerName ?? entry.reviewer?.name) || '',
      role: toStringId(entry.reviewer_role ?? entry.reviewerRole ?? entry.reviewer?.role) || '',
    },
    notes: typeof entry.notes === 'string' ? entry.notes : '',
    updatedAt: entry.updated_at ?? entry.updatedAt ?? null,
    completedFields: normalizeBooleanMap(
      entry.completed_fields ?? entry.completedFields,
    ),
    requestedFields: normalizeBooleanMap(
      entry.requested_fields ?? entry.requestedFields ?? entry.completed_fields ?? entry.completedFields,
    ),
    clearedFields: normalizeBooleanMap(entry.cleared_fields ?? entry.clearedFields),
  };
};

const fromVerificationRequestRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toStringId(row.id);
  if (!id) {
    return null;
  }

  const history = Array.isArray(row.history)
    ? row.history.map((entry) => fromVerificationHistoryRow(entry, id)).filter(Boolean)
    : [];

  const metadata = safeClone(row.metadata);

  return {
    id,
    userId: row.user_id ?? row.userId ?? null,
    status: toStringId(row.status) || 'pending',
    submittedAt: row.submitted_at ?? row.submittedAt ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
    reviewedAt: row.reviewed_at ?? row.reviewedAt ?? null,
    reviewerId: row.reviewer_id ?? row.reviewerId ?? null,
    reviewerName: toStringId(row.reviewer_name ?? row.reviewerName),
    reviewerRole: toStringId(row.reviewer_role ?? row.reviewerRole),
    notes: typeof row.notes === 'string' ? row.notes : '',
    completedFields: normalizeBooleanMap(row.completed_fields ?? row.completedFields),
    requestedFields: normalizeBooleanMap(
      row.requested_fields ?? row.requestedFields ?? row.completed_fields ?? row.completedFields,
    ),
    clearedFields: normalizeBooleanMap(row.cleared_fields ?? row.clearedFields),
    history,
    ...(metadata ? { metadata } : {}),
  };
};

const fromVerificationUploadRow = (row) => {
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
    fileName: toStringId(row.file_name ?? row.fileName),
    fileType: toStringId(row.file_type ?? row.fileType) || 'document',
    fileUrl: toStringId(row.file_url ?? row.fileUrl),
    status: toStringId(row.status) || 'pending',
    uploadedAt: row.uploaded_at ?? row.uploadedAt ?? null,
  };
};

const toVerificationRequestRows = (rows, uid) =>
  (Array.isArray(rows) ? rows : [])
    .filter((row) => row && typeof row === 'object')
    .map((row) => {
      const id = toStringId(row.id);
      if (!id) {
        return null;
      }

      const completed = normalizeBooleanMap(row.completedFields ?? row.completed_fields);
      const requested = normalizeBooleanMap(
        row.requestedFields ?? row.requested_fields ?? row.completedFields ?? row.completed_fields,
      );
      const cleared = normalizeBooleanMap(row.clearedFields ?? row.cleared_fields);

      const history = Array.isArray(row.history)
        ? row.history
            .map((entry) => {
              if (!entry || typeof entry !== 'object') {
                return null;
              }
              const entryId = toStringId(entry.id);
              if (!entryId) {
                return null;
              }

              const reviewer =
                entry.reviewer && typeof entry.reviewer === 'object' ? entry.reviewer : {};

              return {
                id: entryId,
                request_id: toStringId(entry.requestId ?? entry.request_id) || id,
                status: toStringId(entry.status) || 'pending',
                notes: typeof entry.notes === 'string' ? entry.notes : '',
                updated_at: entry.updated_at ?? entry.updatedAt ?? null,
                reviewer_id: toStringId(entry.reviewerId ?? entry.reviewer_id ?? reviewer.id) || null,
                reviewer_name: toStringId(entry.reviewerName ?? entry.reviewer_name ?? reviewer.name) || null,
                reviewer_role: toStringId(entry.reviewerRole ?? entry.reviewer_role ?? reviewer.role) || null,
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
            })
            .filter(Boolean)
        : [];

      const metadata = safeClone(row.metadata);

      const submittedAt = row.submittedAt ?? row.submitted_at ?? null;
      const updatedAt = row.updatedAt ?? row.updated_at ?? submittedAt;
      const reviewedAt = row.reviewedAt ?? row.reviewed_at ?? null;

      return {
        id,
        user_id: row.userId ?? row.user_id ?? uid,
        status: toStringId(row.status) || 'pending',
        submitted_at: submittedAt,
        updated_at: updatedAt,
        reviewed_at: reviewedAt,
        reviewer_id: toStringId(row.reviewerId ?? row.reviewer_id) || null,
        reviewer_name: toStringId(row.reviewerName ?? row.reviewer_name) || null,
        reviewer_role: toStringId(row.reviewerRole ?? row.reviewer_role) || null,
        notes: typeof row.notes === 'string' ? row.notes : '',
        completed_fields: completed,
        requested_fields: requested,
        cleared_fields: cleared,
        ...(metadata ? { metadata } : {}),
        ...(history.length ? { history } : {}),
      };
    })
    .filter(Boolean);

const toVerificationUploadRows = (rows, uid) =>
  (Array.isArray(rows) ? rows : [])
    .filter((row) => row && typeof row === 'object')
    .map((row) => {
      const id = toStringId(row.id);
      if (!id) {
        return null;
      }

      return {
        id,
        user_id: row.userId ?? row.user_id ?? uid,
        request_id: toStringId(row.requestId ?? row.request_id) || null,
        file_name: toStringId(row.fileName ?? row.file_name) || null,
        file_type: toStringId(row.fileType ?? row.file_type) || 'document',
        file_url: toStringId(row.fileUrl ?? row.file_url) || null,
        status: toStringId(row.status) || 'pending',
        uploaded_at: row.uploadedAt ?? row.uploaded_at ?? null,
      };
    })
    .filter(Boolean);

const mergeProfileRelations = (profile, verificationRequests, verificationUploads, transactions) => ({
  ...profile,
  verificationRequests: Array.isArray(verificationRequests) ? verificationRequests : [],
  verificationUploads: Array.isArray(verificationUploads) ? verificationUploads : [],
  transactions: Array.isArray(transactions) ? transactions : [],
});

const toTransactionRows = (rows, uid) =>
  (Array.isArray(rows) ? rows : [])
    .filter((row) => row && typeof row === 'object' && row.id)
    .map((row) => ({
      ...row,
      userId: row.userId ?? uid,
    }));

const persistExtras = (uid, extras) => {
  if (!uid) {
    return;
  }
  const normalized = pickExtras(extras);

  const db = getLocalDatabase();
  const { verificationRequests, verificationUploads, transactions, ...profileFields } = normalized;
  db.upsert('profiles', {
    id: uid,
    ...profileFields,
    updatedAt: new Date().toISOString(),
  });
  db.replaceWhere(
    'verification_requests',
    (row) => matchUserRow(row, uid),
    toVerificationRequestRows(verificationRequests, uid),
  );
  db.replaceWhere(
    'verification_uploads',
    (row) => matchUserRow(row, uid),
    toVerificationUploadRows(verificationUploads, uid),
  );
  db.replaceWhere(
    'profile_transactions',
    (row) => row.userId === uid,
    toTransactionRows(transactions, uid),
  );

  writeLegacyExtras(uid, normalized);
};

export const pickExtras = (u = {}) => ({
  nickname: u.nickname ?? (u.email || ''),
  firstName: u.firstName ?? '',
  lastName: u.lastName ?? '',
  gender: normalizeGender(u.gender),
  dob: u.dob ?? null,
  phone: u.phone ?? '',
  country: u.country ?? '',
  city: u.city ?? '',
  address: u.address ?? '',
  emailVerified: Boolean(u.emailVerified ?? false),
  mfaEnabled: Boolean(u.mfaEnabled ?? false),
  balance: Number.isFinite(Number(u.balance)) ? Number(u.balance) : 0,
  currency: u.currency ?? 'USD',
  casinoBalance: Number.isFinite(Number(u.casinoBalance)) ? Number(u.casinoBalance) : 0,
  transactions: Array.isArray(u.transactions) ? u.transactions : [],
  verificationUploads: Array.isArray(u.verificationUploads) ? u.verificationUploads : [],
  verificationRequests: Array.isArray(u.verificationRequests) ? u.verificationRequests : [],
});

export const loadExtras = (uid) => {
  if (!uid) {
    return pickExtras();
  }

  const db = getLocalDatabase();
  const profileRow = db.findById('profiles', uid);
  const verificationRequestRows = db
    .select('verification_requests', (row) => matchUserRow(row, uid))
    .map(fromVerificationRequestRow)
    .filter(Boolean);
  const verificationUploadRows = db
    .select('verification_uploads', (row) => matchUserRow(row, uid))
    .map(fromVerificationUploadRow)
    .filter(Boolean);
  const transactionRows = db.select('profile_transactions', (row) => row.userId === uid);

  if (
    !profileRow &&
    !verificationRequestRows.length &&
    !verificationUploadRows.length &&
    !transactionRows.length
  ) {
    const legacy = readLegacyExtras(uid);
    if (legacy) {
      persistExtras(uid, legacy);
      return pickExtras(legacy);
    }
    return pickExtras();
  }

  return pickExtras(
    mergeProfileRelations(
      profileRow ?? {},
      verificationRequestRows,
      verificationUploadRows,
      transactionRows,
    ),
  );
};

export const saveExtras = (uid, extras) => {
  persistExtras(uid, extras);
};
