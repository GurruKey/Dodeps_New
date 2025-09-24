import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const LS_KEY = 'dodepus_auth_v1';

// Нормализация пользователя (дефолты)
function normalizeUser(u) {
  if (!u) return u;
  return {
    ...u,
    nickname: u.nickname ?? (u.email || ''),
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    gender: u.gender ?? 'unspecified',
    dob: u.dob ?? null,
    socialStatus: u.socialStatus ?? 'employed',
    country: u.country ?? '',
    city: u.city ?? '',
    address: u.address ?? '',
    emailVerified: u.emailVerified ?? false,
    mfaEnabled: u.mfaEnabled ?? false,              // ← NEW
    transactions: Array.isArray(u.transactions) ? u.transactions : [],
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
        phone: isEmail ? null : identifier,
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
        mfaEnabled: false,                           // ← NEW
        balance: 1000,
        currency: 'USD',
        transactions: [],
      })
    );
  };

  const logout = () => setUser(null);

  const setBalance = (value) =>
    setUser((u) => (u ? { ...u, balance: Number(value) || 0 } : u));

  const addBalance = (delta) =>
    setUser((u) =>
      u ? { ...u, balance: Math.max(0, (u.balance || 0) + Number(delta || 0)) } : u
    );

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

  const value = useMemo(
    () => ({
      user,
      isAuthed: Boolean(user),
      login,
      logout,
      setBalance,
      addBalance,
      setNickname,
      updateProfile,
      addTransaction,
    }),
    [user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
