import { useEffect, useMemo, useState } from 'react';
import { ThemeCtx } from './ThemeContext.js';

const LS_KEY = 'dodepus_theme_v1';
const VALID = new Set(['light', 'dark']);
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

function resolveInitialTheme() {
  if (typeof window === 'undefined') return 'dark';

  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved && VALID.has(saved)) return saved;
  } catch (error) {
    console.warn('ThemeProvider: unable to read theme from storage', error);
  }

  return window.matchMedia && window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(resolveInitialTheme);

  // Синхронизируем с документом и localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');

    try {
      localStorage.setItem(LS_KEY, theme);
    } catch (error) {
      console.warn('ThemeProvider: unable to persist theme', error);
    }
  }, [theme]);

  // Отслеживаем системные изменения, если пользователь явно не сохранял тему
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const media = window.matchMedia(MEDIA_QUERY);
    const handleChange = (event) => {
      try {
        const saved = localStorage.getItem(LS_KEY);
        if (saved && VALID.has(saved)) return; // пользовательская тема имеет приоритет
      } catch (error) {
        console.warn('ThemeProvider: unable to read theme from storage', error);
      }

      setTheme(event.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
