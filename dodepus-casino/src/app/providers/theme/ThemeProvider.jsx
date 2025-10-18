import { useEffect, useMemo, useState } from 'react';
import { ThemeCtx } from './ThemeContext.js';

const LS_KEY = 'dodepus_theme_v1';
const VALID = new Set(['light', 'dark']);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark'); // по умолчанию тёмная

  // Подхватываем сохранённую тему
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved && VALID.has(saved)) setTheme(saved);
    } catch (error) {
      console.warn('ThemeProvider: unable to read theme from storage', error);
    }
  }, []);

  // Применяем к документу и сохраняем
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    try {
      localStorage.setItem(LS_KEY, theme);
    } catch (error) {
      console.warn('ThemeProvider: unable to persist theme', error);
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
