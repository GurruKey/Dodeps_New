import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const LS_KEY = 'dodepus_auth_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Восстановление состояния из localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // игнорируем ошибки парсинга
    }
  }, []);

  // Синхронизация в localStorage
  useEffect(() => {
    try {
      if (user) localStorage.setItem(LS_KEY, JSON.stringify(user));
      else localStorage.removeItem(LS_KEY);
    } catch {
      // если localStorage недоступен — молча пропускаем
    }
  }, [user]);

  const login = (email) => {
    // Простая мок-авторизация
    const next = {
      id: `u_${Math.random().toString(36).slice(2, 9)}`,
      email,
      balance: 1000,
      currency: 'USD',
    };
    setUser(next);
  };

  const logout = () => setUser(null);

  const setBalance = (value) =>
    setUser((u) => (u ? { ...u, balance: Number(value) || 0 } : u));

  const addBalance = (delta) =>
    setUser((u) => (u ? { ...u, balance: Math.max(0, (u.balance || 0) + Number(delta || 0)) } : u));

  const value = useMemo(
    () => ({
      user,
      isAuthed: Boolean(user),
      login,
      logout,
      setBalance,
      addBalance,
    }),
    [user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
