import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import { signUpEmailPassword, signUpPhonePassword } from '../features/auth/api';

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
  } catch {
    return pickExtras();
  }
};

const saveExtras = (uid, extras) => {
  try {
    localStorage.setItem(PROFILE_KEY(uid), JSON.stringify(pickExtras(extras)));
  } catch {}
};

// Собираем «итогового пользователя»: Supabase user + локальные extras
function composeUser(sUser, extras) {
  if (!sUser) return null;
  const emailVerified =
    Boolean(sUser.email_confirmed_at) ||
    Boolean(sUser.confirmed_at) ||
    Boolean(extras?.emailVerified);

  return {
    // из Supabase
    id: sUser.id,
    email: sUser.email ?? '',
    phone: sUser.phone ?? '',
    createdAt: sUser.created_at ?? null,
    app_metadata: sUser.app_metadata ?? {},
    user_metadata: sUser.user_metadata ?? {},

    // локальные поля проекта
    ...pickExtras({ ...extras, emailVerified }),
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Инициализация: поднимаем сессию и собираем пользователя
  useEffect(() => {
    let mounted = true;

    // подчистим легаси сторадж, чтобы не мешал
    try {
      localStorage.removeItem(LEGACY_LS_KEY);
    } catch {}

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session ?? null);
      const sUser = data.session?.user ?? null;

      if (sUser) {
        const extras = loadExtras(sUser.id);
        setUser(composeUser(sUser, extras));
      } else {
        setUser(null);
      }
      setLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      const sUser = newSession?.user ?? null;
      if (sUser) {
        const extras = loadExtras(sUser.id);
        setUser(composeUser(sUser, extras));
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription?.unsubscribe();
    };
  }, []);

  // ---------- Auth API ----------
  const signIn = async ({ email, phone, password }) => {
    // В данный момент реализован только вход по email
    if (email) {
      return await signInEmailPassword({ email, password });
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
      return await signUpEmailPassword({ email, password, redirectTo });
    }
    if (phone) {
      return await signUpPhonePassword({ phone, password });
    }
    throw new Error('Укажите E-mail или телефон для регистрации.');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
