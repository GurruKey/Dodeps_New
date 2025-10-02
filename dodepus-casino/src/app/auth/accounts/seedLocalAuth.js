import { PROFILE_KEY } from '../constants';
import { pickExtras } from '../profileExtras';
import { PRESET_ACCOUNTS } from './seedAccounts';

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
    app_metadata: {
      provider: account.email ? 'email' : 'phone',
      role: account.role ?? 'user',
      ...account.app_metadata,
    },
    user_metadata: {
      role: account.role ?? 'user',
      ...account.user_metadata,
    },
  };
};

const toExtras = (account) =>
  pickExtras({
    email: account.email,
    ...account.extras,
    user_metadata: undefined,
  });

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
