import { PROFILE_KEY } from './constants';
import { getLocalDatabase } from '../database/engine.js';

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

const mergeProfileRelations = (profile, verificationRequests, verificationUploads, transactions) => ({
  ...profile,
  verificationRequests: Array.isArray(verificationRequests) ? verificationRequests : [],
  verificationUploads: Array.isArray(verificationUploads) ? verificationUploads : [],
  transactions: Array.isArray(transactions) ? transactions : [],
});

const toVerificationRows = (rows, uid) =>
  (Array.isArray(rows) ? rows : [])
    .filter((row) => row && typeof row === 'object')
    .map((row) => ({
      ...row,
      userId: row.userId ?? uid,
    }));

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
    (row) => row.userId === uid,
    toVerificationRows(verificationRequests, uid),
  );
  db.replaceWhere(
    'verification_uploads',
    (row) => row.userId === uid,
    toVerificationRows(verificationUploads, uid),
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
  const verificationRequests = db.select('verification_requests', (row) => row.userId === uid);
  const verificationUploads = db.select('verification_uploads', (row) => row.userId === uid);
  const transactionRows = db.select('profile_transactions', (row) => row.userId === uid);

  if (
    !profileRow &&
    !verificationRequests.length &&
    !verificationUploads.length &&
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
      verificationRequests,
      verificationUploads,
      transactionRows,
    ),
  );
};

export const saveExtras = (uid, extras) => {
  persistExtras(uid, extras);
};
