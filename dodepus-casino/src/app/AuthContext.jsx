import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const LS_KEY = 'dodepus_auth_v1';

// Нормализация пользователя (дефолты)
function normalizeUser(u) {
  if (!u) return u;
  return {
    ...u,
    // базовые поля
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
    emailVerified: u.emailVerified ?? false,
    mfaEnabled: u.mfaEnabled ?? false,

    // финансы
    balance: Number.isFinite(Number(u.balance)) ? Number(u.balance) : 0, // реальный, выводимый
    currency: u.currency ?? 'USD',
    // 🔹 НОВОЕ: казино-баланс (не для вывода, не учитывается в withdrawable)
    casinoBalance: Number.isFinite(Number(u.casinoBalance)) ? Number(u.casinoBalance) : 0,

    transactions: Array.isArray(u.transactions) ? u.transactions : [],

    // верификация
    verificationUploads: Array.isArray(u.verificationUploads) ? u.verificationUploads : [],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 1) Восстановление из localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUser(normalizeUser(JSON.parse(raw)));
    } catch {}
  }, []);

  // 2) Синхронизация в localStorage
  useEffect(() => {
    try {
      if (user) localStorage.setItem(LS_KEY, JSON.stringify(user));
      else localStorage.removeItem(LS_KEY);
    } catch {}
  }, [user]);

  // Мок-логин
  const login = (identifier) => {
    const isEmail = typeof identifier === 'string' && identifier.includes('@');
    const id = `u_${Math.random().toString(36).slice(2, 9)}`;
    setUser(
      normalizeUser({
        id,
        email: isEmail ? identifier : null,
        phone: isEmail ? '' : identifier,
        nickname: isEmail ? identifier : '',
        firstName: '',
        lastName: '',
        gender: 'unspecified',
        dob: null,
        socialStatus: 'employed',
        country: '',
        city: '',
        address: '',
        emailVerified: false,
        mfaEnabled: false,
        balance: 1000,           // реальный баланс
        casinoBalance: 0,        // 🔹 НОВОЕ: отдельный «баланс казино»
        currency: 'USD',
        transactions: [],
        verificationUploads: [],
      })
    );
  };

  const logout = () => setUser(null);

  // Реальный (выводимый) баланс
  const setBalance = (value) =>
    setUser((u) => (u ? { ...u, balance: Number(value) || 0 } : u));

  const addBalance = (delta) =>
    setUser((u) =>
      u ? { ...u, balance: Math.max(0, (Number(u.balance) || 0) + Number(delta || 0)) } : u
    );

  // 🔹 НОВОЕ: казино-баланс (не для вывода)
  const setCasinoBalance = (value) =>
    setUser((u) => (u ? { ...u, casinoBalance: Math.max(0, Number(value) || 0) } : u));

  const addCasinoBalance = (delta) =>
    setUser((u) =>
      u ? { ...u, casinoBalance: Math.max(0, (Number(u.casinoBalance) || 0) + Number(delta || 0)) } : u
    );

  // Профильные штуки
  const setNickname = (nickname) =>
    setUser((u) => (u ? { ...u, nickname: nickname ?? '' } : u));

  const updateProfile = (patch) =>
    setUser((u) => (u ? normalizeUser({ ...u, ...patch }) : u));

  const addTransaction = (txn) =>
    setUser((u) => {
      if (!u) return u;
      const id = txn?.id || `tx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const currency = txn?.currency || u.currency || 'USD';
      const date = txn?.date || new Date().toISOString();
      const status = txn?.status || 'success';
      const type = txn?.type || 'deposit';
      const method = txn?.method || 'other';
      const amount = Number(txn?.amount) || 0;
      const nextTxn = { id, currency, date, status, type, method, amount };
      return { ...u, transactions: [nextTxn, ...(u.transactions || [])] };
    });

  const addVerificationUpload = (file) => {
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
    setUser((u) => (u ? { ...u, verificationUploads: [entry, ...(u.verificationUploads || [])] } : u));
  };

  const setEmailVerified = (flag = true) =>
    setUser((u) => (u ? { ...u, emailVerified: !!flag } : u));

  const value = useMemo(
    () => ({
      user,
      isAuthed: Boolean(user),
      login,
      logout,

      // балансы
      balance: user?.balance ?? 0,
      casinoBalance: user?.casinoBalance ?? 0,
      setBalance,
      addBalance,
      setCasinoBalance,
      addCasinoBalance,

      // профиль/транзакции/верификация
      setNickname,
      updateProfile,
      addTransaction,
      addVerificationUpload,
      setEmailVerified,
    }),
    [user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
