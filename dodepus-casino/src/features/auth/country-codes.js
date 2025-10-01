// Минимальный справочник кодов стран для форм входа/регистрации.
// Можно дополнять по мере надобности.

export const COUNTRY_CODES = [
  { code: 'UA', dial: '+380', name: 'Ukraine' },
  { code: 'PL', dial: '+48',  name: 'Poland' },
  { code: 'LT', dial: '+370', name: 'Lithuania' },
  { code: 'LV', dial: '+371', name: 'Latvia' },
  { code: 'EE', dial: '+372', name: 'Estonia' },
  { code: 'GE', dial: '+995', name: 'Georgia' },
  { code: 'MD', dial: '+373', name: 'Moldova' },
  { code: 'RO', dial: '+40',  name: 'Romania' },
  { code: 'DE', dial: '+49',  name: 'Germany' },
  { code: 'CZ', dial: '+420', name: 'Czechia' },
  { code: 'SK', dial: '+421', name: 'Slovakia' },
  { code: 'HU', dial: '+36',  name: 'Hungary' },
  { code: 'TR', dial: '+90',  name: 'Türkiye' },
  { code: 'IL', dial: '+972', name: 'Israel' },
  { code: 'GB', dial: '+44',  name: 'United Kingdom' },
  { code: 'US', dial: '+1',   name: 'USA/Canada' },
];

// По умолчанию — Украина (первый элемент)
export const DEFAULT_COUNTRY = COUNTRY_CODES[0];

// Утилиты (по желанию)
export const findCountryByCode = (code) =>
  COUNTRY_CODES.find((c) => c.code.toUpperCase() === String(code).toUpperCase()) || null;

export const findCountryByDial = (dial) =>
  COUNTRY_CODES.find((c) => c.dial === dial) || null;

// Плейсхолдер для поля номера
export const formatPhonePlaceholder = (dial) =>
  dial === '+1' ? '(XXX) XXX-XXXX' : '(XX) XXX-XX-XX';
