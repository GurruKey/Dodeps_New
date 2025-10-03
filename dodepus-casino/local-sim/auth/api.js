// Реализация локальной авторизации без внешней БД.
// Собрана в каталоге local-sim, чтобы держать всю работу с localStorage рядом.

import {
  buildSeedUserRecords,
  ensureSeededAuthStorage,
} from './accounts/seedLocalAuth';
import { composeUser } from './composeUser';
import { loadExtras } from './profileExtras';

const USERS_KEY = 'dodepus_local_users_v1';
const SESSION_KEY = 'dodepus_local_session_v1';

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_RE = /^\+[1-9]\d{5,14}$/;

const nowIso = () => new Date().toISOString();
const randomId = (prefix) =>
  (globalThis.crypto?.randomUUID?.() ?? `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);

const tryGetStorage = () => {
  try {
    if (typeof globalThis === 'undefined') return null;
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const requireStorage = () => {
  const storage = tryGetStorage();
  if (!storage) {
    throw new Error('Локальное хранилище недоступно. Проверьте настройки браузера.');
  }
  return storage;
};

const readUsers = (storage = tryGetStorage()) => {
  if (!storage) return buildSeedUserRecords();
  return ensureSeededAuthStorage({ storage, usersKey: USERS_KEY });
};

const writeUsers = (users, storage = requireStorage()) => {
  try {
    storage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore quota errors
  }
};

const findByEmail = (users, email) => users.find((u) => u.email && u.email === email);
const findByPhone = (users, phone) => users.find((u) => u.phone && u.phone === phone);

const composeUserWithExtras = (record) => {
  if (!record) return null;
  return composeUser(record, loadExtras(record.id));
};

const storeSession = (session, storage = requireStorage()) => {
  try {
    if (!session) {
      storage.removeItem(SESSION_KEY);
    } else {
      storage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // ignore
  }
};

export const getStoredSession = () => {
  const storage = tryGetStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearStoredSession = () => {
  const storage = tryGetStorage();
  if (!storage) return;
  storeSession(null, storage);
};

export const getUserById = (id) => {
  if (!id) return null;
  const storage = tryGetStorage();
  const users = readUsers(storage);
  return users.find((u) => u.id === id) ?? null;
};

const normalizePhone = (phone) => {
  const raw = String(phone ?? '').trim();
  if (!raw) return '';
  const digits = raw.startsWith('+') ? raw.slice(1).replace(/\D/g, '') : raw.replace(/\D/g, '');
  if (!digits) return '';
  return `+${digits}`;
};

function ensurePasswordStrong(pass) {
  if (
    pass.length < 8 ||
    !/\d/.test(pass) ||
    !/[a-z]/.test(pass) ||
    !/[A-Z]/.test(pass)
  ) {
    throw new Error(
      'Пароль не соответствует требованиям: минимум 8 символов, включая цифры и буквы разного регистра.'
    );
  }
}

function createSession(userId) {
  return {
    userId,
    accessToken: `local_${randomId('token')}`,
    token_type: 'bearer',
    created_at: nowIso(),
  };
}

function createUserRecord({ email, phone, password }) {
  const ts = nowIso();
  const role = 'user';
  const roles = ['user'];
  return {
    id: randomId('usr'),
    email: email ?? '',
    phone: phone ?? '',
    password,
    created_at: ts,
    confirmed_at: ts,
    email_confirmed_at: email ? ts : null,
    phone_confirmed_at: phone ? ts : null,
    last_sign_in_at: ts,
    app_metadata: {
      provider: email ? 'email' : 'phone',
      role,
      roles,
    },
    user_metadata: {
      role,
      roles,
      isAdmin: false,
    },
  };
}

export async function signUpEmailPassword({ email, password }) {
  const emailNorm = String(email || '').toLowerCase().trim();
  const passNorm = String(password || '').trim();

  if (!EMAIL_RE.test(emailNorm)) throw new Error('Некорректный адрес e-mail.');
  ensurePasswordStrong(passNorm);

  const storage = requireStorage();
  const users = readUsers(storage);
  if (findByEmail(users, emailNorm)) {
    throw new Error('Такой пользователь уже зарегистрирован.');
  }

  const user = createUserRecord({ email: emailNorm, password: passNorm });
  users.push(user);
  writeUsers(users, storage);

  const session = createSession(user.id);
  storeSession(session, storage);

  return {
    user: composeUserWithExtras(user),
    session,
    needsEmailConfirm: false,
  };
}

export async function signInEmailPassword({ email, password }) {
  const emailNorm = String(email || '').toLowerCase().trim();
  const passNorm = String(password || '').trim();

  if (!EMAIL_RE.test(emailNorm) || !passNorm) {
    throw new Error('Введите e-mail и пароль.');
  }

  const storage = requireStorage();
  const users = readUsers(storage);
  const user = findByEmail(users, emailNorm);

  if (!user) {
    throw new Error('Пользователь не найден.');
  }
  if (user.password !== passNorm) {
    throw new Error('Неверный пароль.');
  }

  user.last_sign_in_at = nowIso();
  writeUsers(users, storage);

  const session = createSession(user.id);
  storeSession(session, storage);

  return {
    user: composeUserWithExtras(user),
    session,
  };
}

export async function signUpPhonePassword({ phone, password } = {}) {
  const phoneNorm = normalizePhone(phone);
  const passNorm = String(password || '').trim();

  if (!PHONE_RE.test(phoneNorm)) throw new Error('Некорректный номер телефона.');
  ensurePasswordStrong(passNorm);

  const storage = requireStorage();
  const users = readUsers(storage);
  if (findByPhone(users, phoneNorm)) {
    throw new Error('Такой номер уже зарегистрирован.');
  }

  const user = createUserRecord({ phone: phoneNorm, password: passNorm });
  users.push(user);
  writeUsers(users, storage);

  const session = createSession(user.id);
  storeSession(session, storage);

  return {
    user: composeUserWithExtras(user),
    session,
    needsSmsVerify: false,
  };
}

export const __localAuthInternals = {
  USERS_KEY,
  SESSION_KEY,
  readUsers,
  writeUsers,
  storeSession,
};
