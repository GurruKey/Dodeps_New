import { PROFILE_KEY } from '../constants';
import { pickExtras } from '../profileExtras';
import { applyVerificationSeed } from '../../seed/verificationSeed.js';
import { PRESET_ACCOUNTS } from './seedAccounts';

const ADMIN_ROLES = new Set(['admin', 'owner']);

const normalizeRole = (role, fallback = '') => {
  const raw = typeof role === 'string' ? role.trim() : '';
  return raw ? raw.toLowerCase() : fallback;
};

const mergeRoles = (accountRole, extraRoles = []) => {
  const baseRole = normalizeRole(accountRole, 'user');
  const roles = new Set();
  roles.add(baseRole);
  extraRoles
    .flat()
    .filter(Boolean)
    .map((role) => normalizeRole(role))
    .forEach((role) => {
      if (role) roles.add(role);
    });

  if (ADMIN_ROLES.has(baseRole)) {
    roles.add('admin');
  }

  return {
    baseRole,
    roles: Array.from(roles),
  };
};

const buildTimestamps = (index) => {
  const base = new Date(Date.UTC(2024, 0, 1, 12, index, 0));
  const iso = base.toISOString();
  return {
    created_at: iso,
    confirmed_at: iso,
    email_confirmed_at: iso,
    phone_confirmed_at: null,
  };
};

const toStoredUser = (account, index) => {
  const timestamps = buildTimestamps(index);
  const { baseRole, roles } = mergeRoles(account.role, [
    account.roles,
    account.app_metadata?.roles,
    account.user_metadata?.roles,
  ]);
  const isAdmin = roles.includes('admin') || Boolean(account?.user_metadata?.isAdmin);

  const appMetadata = {
    provider: account.email ? 'email' : 'phone',
    role: baseRole,
    roles,
    ...account.app_metadata,
  };

  if (Array.isArray(account.app_metadata?.roles) && account.app_metadata.roles.length) {
    const mergedAppRoles = new Set([
      ...roles,
      ...account.app_metadata.roles.map((role) => normalizeRole(role)).filter(Boolean),
    ]);
    appMetadata.roles = Array.from(mergedAppRoles);
  }

  const userMetadata = {
    role: baseRole,
    roles,
    isAdmin,
    ...account.user_metadata,
  };

  if (isAdmin) {
    appMetadata.isAdmin = true;
    userMetadata.isAdmin = true;
  }

  if (Array.isArray(account.user_metadata?.roles) && account.user_metadata.roles.length) {
    const mergedUserRoles = new Set([
      ...roles,
      ...account.user_metadata.roles.map((role) => normalizeRole(role)).filter(Boolean),
    ]);
    userMetadata.roles = Array.from(mergedUserRoles);
  }

  if (!userMetadata.roles?.length) {
    userMetadata.roles = roles;
  }

  return {
    id: account.id,
    email: (account.email ?? '').toLowerCase(),
    phone: account.phone ?? '',
    password: account.password,
    created_at: account.created_at ?? timestamps.created_at,
    confirmed_at: account.confirmed_at ?? timestamps.confirmed_at,
    email_confirmed_at:
      account.email_confirmed_at ?? (account.email ? timestamps.email_confirmed_at : null),
    phone_confirmed_at:
      account.phone_confirmed_at ?? (account.phone ? timestamps.phone_confirmed_at : null),
    last_sign_in_at: account.last_sign_in_at ?? null,
    app_metadata: appMetadata,
    user_metadata: userMetadata,
  };
};

const toExtras = (account) => {
  const emailVerified = Boolean(
    account.email_confirmed_at ?? account.confirmed_at ?? account.extras?.emailVerified ?? false
  );

  const extras = pickExtras({
    email: account.email,
    emailVerified,
    ...account.extras,
    user_metadata: undefined,
  });

  return applyVerificationSeed(extras, account.id);
};

export const buildSeedUserRecords = () => PRESET_ACCOUNTS.map(toStoredUser);

export function seedLocalAuthStorage({ storage, usersKey }) {
  const records = buildSeedUserRecords();

  try {
    storage.setItem(usersKey, JSON.stringify(records));
  } catch (err) {
    console.warn('Не удалось сохранить предустановленных пользователей', err);
  }

  records.forEach((record, idx) => {
    const profileKey = PROFILE_KEY(record.id);
    try {
      if (storage.getItem(profileKey)) return;
      storage.setItem(profileKey, JSON.stringify(toExtras(PRESET_ACCOUNTS[idx])));
    } catch (err) {
      console.warn(`Не удалось сохранить профиль пользователя ${record.id}`, err);
    }
  });

  return records;
}

export function ensureSeededAuthStorage({ storage, usersKey }) {
  try {
    const raw = storage.getItem(usersKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Не удалось прочитать сохранённых пользователей, будет выполнено повторное заполнение', err);
  }

  return seedLocalAuthStorage({ storage, usersKey });
}
