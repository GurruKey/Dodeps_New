/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  __localAuthInternals,
  clearStoredSession,
  getStoredSession,
  getUserById,
  signInEmailPassword,
  signUpEmailPassword,
  signUpPhonePassword,
} from '../features/auth/api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// ---- legacy key (до Supabase) — подчистим при инициализации
const LEGACY_LS_KEY = 'dodepus_auth_v1';
// Персист профиля по uid
const PROFILE_KEY = (uid) => `dodepus_profile_v1:${uid}`;

// Только доп. поля профиля (держим локально, пока БД пустая)
const pickExtras = (u = {}) => ({
  // базовые
  nickname: u.nickname ?? (u.email || ''),
  firstName: u.firstName ?? '',
  lastName: u.lastName ?? '',
  gender: u.gender ?? 'unspecified',
  dob: u.dob ?? null,

  // контакты/адрес
  phone: u.phone ?? '',
  country: u.country ?? '',
  city: u.city ?? '',
  address: u.address ?? '',
  emailVerified: Boolean(u.emailVerified ?? false),
  mfaEnabled: Boolean(u.mfaEnabled ?? false),

  // финансы
  balance: Number.isFinite(Number(u.balance)) ? Number(u.balance) : 0,
  currency: u.currency ?? 'USD',
  casinoBalance: Number.isFinite(Number(u.casinoBalance)) ? Number(u.casinoBalance) : 0,

  // активности
  transactions: Array.isArray(u.transactions) ? u.transactions : [],
  verificationUploads: Array.isArray(u.verificationUploads) ? u.verificationUploads : [],
});

const loadExtras = (uid) => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY(uid));
    return raw ? pickExtras(JSON.parse(raw)) : pickExtras();
  } catch (err) {
    console.warn('Не удалось загрузить локальный профиль пользователя', err);
    return pickExtras();
  }
};

const saveExtras = (uid, extras) => {
  try {
    localStorage.setItem(PROFILE_KEY(uid), JSON.stringify(pickExtras(extras)));
  } catch (err) {
    console.warn('Не удалось сохранить локальные данные профиля', err);
  }
};

// Собираем «итогового пользователя»: локальная запись + локальные extras
function composeUser(record, extras) {
  if (!record) return null;
  const emailVerified =
    Boolean(record.email_confirmed_at) ||
    Boolean(record.confirmed_at) ||
    Boolean(extras?.emailVerified);

  return {
    id: record.id,
    email: record.email ?? '',
    phone: record.phone ?? '',
    createdAt: record.created_at ?? null,
    app_metadata: record.app_metadata ?? {},
    user_metadata: record.user_metadata ?? {},

    ...pickExtras({ ...extras, emailVerified, email: record.email, phone: record.phone }),
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Инициализация: поднимаем сессию и собираем пользователя
  useEffect(() => {
    let mounted = true;

    if (typeof window === 'undefined') {
      setLoading(false);
      return () => {
        /* noop */
      };
    }

    // подчистим легаси сторадж, чтобы не мешал
    try {
      localStorage.removeItem(LEGACY_LS_KEY);
    } catch (err) {
      console.warn('Не удалось очистить устаревшие данные авторизации', err);
    }

    const storedSession = getStoredSession();
    if (!mounted) return undefined;

    if (storedSession?.userId) {
      const record = getUserById(storedSession.userId);
      if (record) {
        const extras = loadExtras(record.id);
        setSession(storedSession);
        setUser(composeUser(record, extras));
      } else {
        clearStoredSession();
        setSession(null);
        setUser(null);
      }
    } else {
      setSession(null);
      setUser(null);
    }
    setLoading(false);

    const onStorage = (event) => {
      if (event.key !== null && event.key !== __localAuthInternals.SESSION_KEY) return;
      if (!mounted) return;
      const nextSession = getStoredSession();
      if (nextSession?.userId) {
        const record = getUserById(nextSession.userId);
        if (record) {
          const extras = loadExtras(record.id);
          setSession(nextSession);
          setUser(composeUser(record, extras));
          return;
        }
      }
      setSession(null);
      setUser(null);
    };

    window.addEventListener('storage', onStorage);

    return () => {
      mounted = false;
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // ---------- Auth API ----------
  const signIn = async ({ email, phone, password }) => {
    // В данный момент реализован только вход по email
    if (email) {
      const result = await signInEmailPassword({ email, password });
      const extras = loadExtras(result.user.id);
      const composedUser = composeUser(result.user, extras);
      setSession(result.session);
      setUser(composedUser);
      return { ...result, user: composedUser };
    }
    // TODO: Реализовать signInPhonePassword по аналогии, когда потребуется
    if (phone) {
      throw new Error('Вход по номеру телефона пока не реализован.');
    }

    throw new Error('Укажите E-mail для входа.');
  };

  // регистрация вынесена в фичу
  const signUp = async ({ email, phone, password, redirectTo } = {}) => {
    if (email) {
      const result = await signUpEmailPassword({ email, password, redirectTo });
      const extras = loadExtras(result.user.id);
      const composedUser = composeUser(result.user, extras);
      setSession(result.session);
      setUser(composedUser);
      return { ...result, user: composedUser };
    }
    if (phone) {
      const result = await signUpPhonePassword({ phone, password });
      const extras = loadExtras(result.user.id);
      const composedUser = composeUser(result.user, extras);
      setSession(result.session);
      setUser(composedUser);
      return { ...result, user: composedUser };
    }
    throw new Error('Укажите E-mail или телефон для регистрации.');
  };

  const signOut = async () => {
    clearStoredSession();
    setSession(null);
    setUser(null);
  };

  // ---------- Локальные методы профиля (пока БД пустая) ----------
  const ensureAuthed = () => {
    if (!user?.id) throw new Error('Требуется вход в аккаунт');
  };

  const patchUser = (patch) => {
    setUser((u) => {
      if (!u) return u;
      const next = { ...u, ...patch };
      saveExtras(u.id, pickExtras(next));
      return next;
    });
  };

  // Балансы
  const setBalance = (value) => {
    ensureAuthed();
    patchUser({ balance: Number(value) || 0 });
  };

  const addBalance = (delta) => {
    ensureAuthed();
    patchUser({ balance: Math.max(0, (Number(user.balance) || 0) + Number(delta || 0)) });
  };

  const setCasinoBalance = (value) => {
    ensureAuthed();
    patchUser({ casinoBalance: Math.max(0, Number(value) || 0) });
  };

  const addCasinoBalance = (delta) => {
    ensureAuthed();
    patchUser({
      casinoBalance: Math.max(0, (Number(user.casinoBalance) || 0) + Number(delta || 0)),
    });
  };

  // Профиль / транзакции / верификация
  const setNickname = (nickname) => {
    ensureAuthed();
    patchUser({ nickname: nickname ?? '' });
  };

  const updateProfile = (patch) => {
    ensureAuthed();
    patchUser({ ...patch });
  };

  const addTransaction = (txn) => {
    ensureAuthed();
    const id =
      txn?.id || `tx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const currency = txn?.currency || user.currency || 'USD';
    const date = txn?.date || new Date().toISOString();
    const status = txn?.status || 'success';
    const type = txn?.type || 'deposit';
    const method = txn?.method || 'other';
    const amount = Number(txn?.amount) || 0;
    const nextTxn = { id, currency, date, status, type, method, amount };
    patchUser({ transactions: [nextTxn, ...(user.transactions || [])] });
  };

  const addVerificationUpload = (file) => {
    ensureAuthed();
    if (!file) return;
    const entry = {
      id:
        (globalThis.crypto?.randomUUID?.() ??
          `vf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`),
      name: file.name ?? 'document',
      type: file.type ?? '',
      size: file.size ?? 0,
      uploadedAt: new Date().toISOString(),
    };
    patchUser({ verificationUploads: [entry, ...(user.verificationUploads || [])] });
  };

  const setEmailVerified = (flag = true) => {
    ensureAuthed();
    patchUser({ emailVerified: !!flag });
  };

  // ---------- Публичное значение контекста ----------
  const value = useMemo(
    () => ({
      // базовое
      loading,
      session,
      user,
      isAuthed: Boolean(user),

      // auth api
      signIn,
      signUp,
      signOut,

      // обратная совместимость с прежними именами
      login: signIn,
      logout: signOut,

      // профиль/балансы/верификация (локально)
      balance: user?.balance ?? 0,
      casinoBalance: user?.casinoBalance ?? 0,
      setBalance,
      addBalance,
      setCasinoBalance,
      addCasinoBalance,
      setNickname,
      updateProfile,
      addTransaction,
      addVerificationUpload,
      setEmailVerified,
    }),
    [loading, session, user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
