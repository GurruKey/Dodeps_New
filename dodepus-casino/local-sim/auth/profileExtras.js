import { PROFILE_KEY } from './constants';

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
  try {
    const raw = localStorage.getItem(PROFILE_KEY(uid));
    return raw ? pickExtras(JSON.parse(raw)) : pickExtras();
  } catch (err) {
    console.warn('Не удалось загрузить локальный профиль пользователя', err);
    return pickExtras();
  }
};

export const saveExtras = (uid, extras) => {
  try {
    localStorage.setItem(PROFILE_KEY(uid), JSON.stringify(pickExtras(extras)));
  } catch (err) {
    console.warn('Не удалось сохранить локальные данные профиля', err);
  }
};
