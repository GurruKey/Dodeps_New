import { PROFILE_KEY } from './constants';

export const pickExtras = (u = {}) => ({
  nickname: u.nickname ?? (u.email || ''),
  firstName: u.firstName ?? '',
  lastName: u.lastName ?? '',
  gender: u.gender ?? 'unspecified',
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
