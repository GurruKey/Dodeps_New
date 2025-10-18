import { enrichAccountsWithTransactions } from './transactionsSeed.js';

let authUsersDataset;
let profilesDataset;

try {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  authUsersDataset = require('../../../db/auth_users.json');
  profilesDataset = require('../../../db/profiles.json');
} catch {
  const [{ default: authUsersRaw }, { default: profilesRaw }] = await Promise.all([
    import('../../../db/auth_users.json?raw'),
    import('../../../db/profiles.json?raw'),
  ]);
  authUsersDataset = JSON.parse(authUsersRaw);
  profilesDataset = JSON.parse(profilesRaw);
}

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const ensureObject = (value) => (value && typeof value === 'object' ? { ...value } : {});

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

const toNullableIso = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString();
  }

  return null;
};

const toPositiveNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toCurrencyCode = (value, fallback = 'USD') => {
  const text = toTrimmedString(value, '');
  return text ? text.toUpperCase() : fallback;
};

const toNullableInt = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.trunc(numeric);
};

const buildProfileExtrasMap = () => {
  const entries = ensureArray(profilesDataset)
    .map((row) => {
      const id = toTrimmedString(row?.id, '');
      if (!id) {
        return null;
      }

      const extras = {
        nickname: toTrimmedString(row.nickname),
        firstName: toTrimmedString(row.first_name),
        lastName: toTrimmedString(row.last_name),
        gender: toLowerCaseString(row.gender, ''),
        dob: row.dob ?? null,
        phone: toTrimmedString(row.phone),
        country: toTrimmedString(row.country),
        city: toTrimmedString(row.city),
        address: toTrimmedString(row.address),
        emailVerified: Boolean(row.email_verified),
        mfaEnabled: Boolean(row.mfa_enabled),
        balance: toPositiveNumber(row.balance, 0),
        casinoBalance: toPositiveNumber(row.casino_balance, 0),
        currency: toCurrencyCode(row.currency, 'USD'),
        updatedAt: toNullableIso(row.updated_at),
        skipTransactionsSeed: true,
        transactions: [],
      };

      return [id, extras];
    })
    .filter(Boolean);

  return new Map(entries);
};

const profileExtrasMap = buildProfileExtrasMap();

const normalizeRoles = (roles, baseRole) => {
  const normalized = new Set();
  if (baseRole) {
    normalized.add(baseRole);
  }

  ensureArray(roles)
    .map((role) => toLowerCaseString(role, ''))
    .filter(Boolean)
    .forEach((role) => normalized.add(role));

  if (!normalized.has('user')) {
    normalized.add('user');
  }

  return Array.from(normalized);
};

const mapAuthRowToAccount = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toTrimmedString(row.id, '');
  if (!id) {
    return null;
  }

  const rawAppMetadata = ensureObject(row.app_metadata);
  const rawUserMetadata = ensureObject(row.user_metadata);

  const baseRole =
    toLowerCaseString(row.role, '') ||
    toLowerCaseString(rawAppMetadata.role, '') ||
    toLowerCaseString(rawUserMetadata.role, '') ||
    'user';

  const roles = normalizeRoles(row.roles ?? rawAppMetadata.roles ?? rawUserMetadata.roles, baseRole);

  const appMetadata = {
    ...rawAppMetadata,
    role: baseRole,
    roles,
  };

  const userMetadata = {
    ...rawUserMetadata,
    role: baseRole,
    roles,
  };

  if (roles.includes('admin')) {
    appMetadata.isAdmin = true;
    userMetadata.isAdmin = true;
  }

  const extras = profileExtrasMap.get(id) ?? { skipTransactionsSeed: true, transactions: [] };

  return {
    id,
    email: toLowerCaseString(row.email, ''),
    phone: toTrimmedString(row.phone, ''),
    password: toTrimmedString(row.password, ''),
    status: toLowerCaseString(row.status, 'active') || 'active',
    role: baseRole,
    role_level: toNullableInt(row.role_level ?? row.roleLevel ?? userMetadata.roleLevel ?? appMetadata.roleLevel),
    roles,
    created_at: toNullableIso(row.created_at),
    confirmed_at: toNullableIso(row.confirmed_at),
    email_confirmed_at: toNullableIso(row.email_confirmed_at),
    phone_confirmed_at: toNullableIso(row.phone_confirmed_at),
    last_sign_in_at: toNullableIso(row.last_sign_in_at),
    app_metadata: appMetadata,
    user_metadata: userMetadata,
    extras,
  };
};

const BASE_ACCOUNTS = Object.freeze(
  ensureArray(authUsersDataset)
    .map((row) => mapAuthRowToAccount(row))
    .filter(Boolean),
);

export const PRESET_ACCOUNTS = Object.freeze(enrichAccountsWithTransactions([...BASE_ACCOUNTS]));
