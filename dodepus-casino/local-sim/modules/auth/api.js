// Реализация локальной авторизации без внешней БД.
// Собрана в каталоге local-sim, чтобы держать всю работу с localStorage рядом.

import {
  buildSeedUserRecords,
  ensureSeededAuthStorage,
} from './accounts/seedLocalAuth';
import { composeUser } from './composeUser';
import { loadExtras, saveExtras } from './profileExtras';
import { findAdminRoleById } from '../access/index.js';
import { getRankDefinitionById, getRankBenefitTemplate } from '../rank/api.js';
import { getLocalDatabase } from '../../database/engine.js';

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
  const db = getLocalDatabase();
  const dbUsers = db.select('auth_users');
  if (dbUsers.length) {
    return dbUsers;
  }

  if (!storage) {
    const fallback = buildSeedUserRecords();
    db.replaceWhere('auth_users', () => true, fallback);
    return fallback;
  }

  ensureSeededAuthStorage({ storage, usersKey: USERS_KEY });
  return db.select('auth_users');
};

const writeUsers = (users, storage = requireStorage()) => {
  try {
    storage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore quota errors
  }

  try {
    const db = getLocalDatabase();
    const normalized = Array.isArray(users)
      ? users.filter((user) => user && typeof user === 'object')
      : [];
    db.replaceWhere('auth_users', () => true, normalized);
  } catch (err) {
    console.warn('[local-sim] Не удалось обновить таблицу auth_users в локальной БД', err);
  }
};

const normalizeRoleValue = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed ? trimmed.toLowerCase() : '';
};

const normalizeRoleConfig = (roleConfig) => {
  if (!roleConfig) return null;
  const group = normalizeRoleValue(roleConfig.group ?? roleConfig.id);
  if (!group) return null;

  const level =
    typeof roleConfig.level === 'number' && Number.isFinite(roleConfig.level)
      ? roleConfig.level
      : undefined;

  return {
    id: roleConfig.id,
    name: roleConfig.name ?? roleConfig.id,
    group,
    level,
    isAdmin: Boolean(roleConfig.isAdmin),
  };
};

const getRoleConfigById = (roleId) => {
  const normalizedId = String(roleId ?? '').trim();
  if (!normalizedId) return null;
  const match = findAdminRoleById(normalizedId);
  return normalizeRoleConfig(match);
};

const normalizeRankConfig = (rankConfig) => {
  if (!rankConfig) return null;
  const tier =
    typeof rankConfig.tier === 'number' && Number.isFinite(rankConfig.tier)
      ? rankConfig.tier
      : undefined;

  return {
    id: rankConfig.id,
    name: rankConfig.name ?? rankConfig.id,
    group: typeof rankConfig.group === 'string' ? rankConfig.group : 'player',
    tier,
    description: rankConfig.description ?? '',
  };
};

const getRankConfigById = (rankId) => normalizeRankConfig(getRankDefinitionById(rankId));

const getRankBenefitsTemplate = (rankId) => {
  const template = getRankBenefitTemplate(rankId);
  if (!template || typeof template !== 'object') {
    return {};
  }

  return Object.entries(template).reduce((acc, [key, value]) => {
    acc[key] = Boolean(value);
    return acc;
  }, {});
};

const collectRoles = (record, { id, group, isAdmin }) => {
  const allowAdmin = Boolean(isAdmin);
  const roles = [];

  const addRole = (value) => {
    const normalized = normalizeRoleValue(value);
    if (!normalized) return;
    if (!allowAdmin && normalized === 'admin') return;
    if (!roles.includes(normalized)) {
      roles.push(normalized);
    }
  };

  const addRoles = (values) => {
    if (!values) return;
    if (Array.isArray(values)) {
      values.forEach(addRole);
      return;
    }
    addRole(values);
  };

  addRole(group);
  addRole(id);
  addRole(record?.role);
  addRole(record?.app_metadata?.role);
  addRole(record?.user_metadata?.role);
  addRoles(record?.roles);
  addRoles(record?.app_metadata?.roles);
  addRoles(record?.user_metadata?.roles);

  if (!roles.includes('user')) {
    roles.push('user');
  }

  if (allowAdmin) {
    addRole('admin');
  }

  return roles;
};

const applyRoleToRecord = (record, roleConfig) => {
  if (!record || !roleConfig) return record;
  const { group, level, isAdmin } = roleConfig;
  const mergedRoles = collectRoles(record, roleConfig);

  const appMetadata = {
    ...(record.app_metadata ?? {}),
    roleId: roleConfig.id,
    role: group,
    roles: mergedRoles,
    isAdmin,
  };

  const userMetadata = {
    ...(record.user_metadata ?? {}),
    roleId: roleConfig.id,
    role: group,
    roles: mergedRoles,
    isAdmin,
  };

  if (typeof level === 'number') {
    appMetadata.roleLevel = level;
    appMetadata.level = level;
    userMetadata.roleLevel = level;
    userMetadata.level = level;
  } else {
    delete appMetadata.roleLevel;
    delete appMetadata.level;
    delete userMetadata.roleLevel;
    delete userMetadata.level;
  }

  const updatedRecord = {
    ...record,
    role: group,
    roleId: roleConfig.id,
    roles: mergedRoles,
    roleLevel: typeof level === 'number' ? level : undefined,
    isAdmin,
    app_metadata: appMetadata,
    user_metadata: userMetadata,
  };

  if (typeof level !== 'number') {
    delete updatedRecord.roleLevel;
  }

  return updatedRecord;
};

const applyRankToRecord = (record, rankConfig, benefitOverrides) => {
  if (!record || !rankConfig) return record;

  const baseBenefits = getRankBenefitsTemplate(rankConfig.id);
  const overrideKeys =
    benefitOverrides && typeof benefitOverrides === 'object' ? Object.keys(benefitOverrides) : [];
  const mergedKeys = Array.from(
    new Set([...Object.keys(baseBenefits ?? {}), ...overrideKeys])
  );

  const normalizedBenefits = mergedKeys.reduce((acc, key) => {
    if (benefitOverrides && Object.prototype.hasOwnProperty.call(benefitOverrides, key)) {
      acc[key] = Boolean(benefitOverrides[key]);
    } else {
      acc[key] = Boolean(baseBenefits?.[key]);
    }
    return acc;
  }, {});

  const appMetadata = {
    ...(record.app_metadata ?? {}),
    playerRankId: rankConfig.id,
    playerRank: rankConfig.group,
    playerRankTier: rankConfig.tier,
    playerRankBenefits: normalizedBenefits,
  };

  const userMetadata = {
    ...(record.user_metadata ?? {}),
    playerRankId: rankConfig.id,
    playerRank: rankConfig.group,
    playerRankTier: rankConfig.tier,
    playerRankBenefits: normalizedBenefits,
  };

  const hasAdminRole =
    (Array.isArray(record?.roles) && record.roles.includes('admin')) ||
    (Array.isArray(record?.app_metadata?.roles) && record.app_metadata.roles.includes('admin')) ||
    (Array.isArray(record?.user_metadata?.roles) && record.user_metadata.roles.includes('admin'));

  const updatedRecord = {
    ...record,
    playerRankId: rankConfig.id,
    playerRank: rankConfig.group,
    playerRankTier: rankConfig.tier,
    playerRankBenefits: normalizedBenefits,
    app_metadata: appMetadata,
    user_metadata: userMetadata,
    isAdmin: hasAdminRole,
  };

  if (typeof rankConfig.tier !== 'number') {
    delete appMetadata.playerRankTier;
    delete userMetadata.playerRankTier;
    delete updatedRecord.playerRankTier;
  }

  updatedRecord.app_metadata.isAdmin = hasAdminRole;
  updatedRecord.user_metadata.isAdmin = hasAdminRole;

  return updatedRecord;
};

const WAIT_ASSIGN_ROLE_MS = 400;

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
    confirmed_at: null,
    email_confirmed_at: null,
    phone_confirmed_at: null,
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

export async function assignUserRole({ userId, roleId, delay = WAIT_ASSIGN_ROLE_MS } = {}) {
  const normalizedUserId = String(userId ?? '').trim();
  if (!normalizedUserId) {
    throw new Error('Укажите ID пользователя.');
  }

  const roleConfig = getRoleConfigById(roleId);
  if (!roleConfig) {
    throw new Error('Выбранная роль недоступна.');
  }

  const storage = requireStorage();
  const users = readUsers(storage);
  const userIndex = users.findIndex((user) => user.id === normalizedUserId);

  if (userIndex === -1) {
    throw new Error('Пользователь с таким ID не найден.');
  }

  const record = users[userIndex];
  const updatedRecord = applyRoleToRecord(record, roleConfig);
  users[userIndex] = updatedRecord;
  writeUsers(users, storage);

  const waitMs = Math.max(0, Number(delay) || 0);
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  return composeUserWithExtras(updatedRecord);
}

export async function assignUserRank({
  userId,
  rankId,
  benefits,
  delay = WAIT_ASSIGN_ROLE_MS,
} = {}) {
  const normalizedUserId = String(userId ?? '').trim();
  if (!normalizedUserId) {
    throw new Error('Укажите ID пользователя.');
  }

  const rankConfig = getRankConfigById(rankId);
  if (!rankConfig) {
    throw new Error('Выбранный ранг недоступен.');
  }

  const storage = requireStorage();
  const users = readUsers(storage);
  const userIndex = users.findIndex((user) => user.id === normalizedUserId);

  if (userIndex === -1) {
    throw new Error('Пользователь с таким ID не найден.');
  }

  const record = users[userIndex];
  const updatedRecord = applyRankToRecord(record, rankConfig, benefits);
  users[userIndex] = updatedRecord;
  writeUsers(users, storage);

  const waitMs = Math.max(0, Number(delay) || 0);
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  return composeUserWithExtras(updatedRecord);
}

const isEmailDuplicate = (users, email, currentId) =>
  users.some((user) => user.id !== currentId && user.email && user.email === email);

const isPhoneDuplicate = (users, phone, currentId) =>
  users.some((user) => user.id !== currentId && user.phone && user.phone === phone);

export async function updateUserContacts({ userId, email, phone } = {}) {
  const normalizedUserId = String(userId ?? '').trim();
  if (!normalizedUserId) {
    throw new Error('Укажите ID пользователя.');
  }

  const storage = requireStorage();
  const users = readUsers(storage);
  const index = users.findIndex((user) => user.id === normalizedUserId);

  if (index === -1) {
    throw new Error('Пользователь с таким ID не найден.');
  }

  const record = users[index];

  const patchEmail = email !== undefined;
  const patchPhone = phone !== undefined;

  if (!patchEmail && !patchPhone) {
    return composeUserWithExtras(record);
  }

  const normalizedEmail = patchEmail
    ? String(email ?? '')
        .trim()
        .toLowerCase()
    : record.email ?? '';

  if (patchEmail) {
    if (normalizedEmail && !EMAIL_RE.test(normalizedEmail)) {
      throw new Error('Некорректный адрес e-mail.');
    }

    if (normalizedEmail && isEmailDuplicate(users, normalizedEmail, record.id)) {
      throw new Error('E-mail уже используется другим пользователем.');
    }
  }

  const normalizedPhone = patchPhone ? normalizePhone(phone) : record.phone ?? '';

  if (patchPhone) {
    if (normalizedPhone && !PHONE_RE.test(normalizedPhone)) {
      throw new Error('Некорректный номер телефона.');
    }

    if (normalizedPhone && isPhoneDuplicate(users, normalizedPhone, record.id)) {
      throw new Error('Номер телефона уже используется другим пользователем.');
    }
  }

  const updatedRecord = { ...record };

  if (patchEmail) {
    updatedRecord.email = normalizedEmail;
    if ((record.email ?? '') !== normalizedEmail) {
      updatedRecord.email_confirmed_at = null;
    }
  }

  if (patchPhone) {
    updatedRecord.phone = normalizedPhone;
    if ((record.phone ?? '') !== normalizedPhone) {
      updatedRecord.phone_confirmed_at = null;
    }
  }

  users[index] = updatedRecord;
  writeUsers(users, storage);

  let extras = loadExtras(record.id);
  let extrasChanged = false;

  if (patchEmail && (record.email ?? '') !== normalizedEmail) {
    extras = { ...extras, emailVerified: false };
    extrasChanged = true;
  }

  if (extrasChanged) {
    saveExtras(record.id, extras);
  }

  return composeUser(updatedRecord, extras);
}

export const __localAuthInternals = {
  USERS_KEY,
  SESSION_KEY,
  readUsers,
  writeUsers,
  storeSession,
};

