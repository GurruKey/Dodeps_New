import {
  __localAuthInternals,
  clearStoredSession,
  getStoredSession,
  getUserById,
} from '../api';
import { LEGACY_LS_KEY } from '../constants';
import { composeUser } from '../composeUser';
import { loadExtras } from '../profileExtras';

export function initAuthEffect({ setSession, setUser, setLoading }) {
  let mounted = true;

  if (typeof window === 'undefined') {
    setLoading(false);
    return () => {
      /* noop */
    };
  }

  try {
    localStorage.removeItem(LEGACY_LS_KEY);
  } catch (err) {
    console.warn('Не удалось очистить устаревшие данные авторизации', err);
  }

  const hydrateFromSession = (storedSession) => {
    if (storedSession?.userId) {
      const record = getUserById(storedSession.userId);
      if (record) {
        const extras = loadExtras(record.id);
        setSession(storedSession);
        setUser(composeUser(record, extras));
        return;
      }
    }
    clearStoredSession();
    setSession(null);
    setUser(null);
  };

  hydrateFromSession(getStoredSession());
  setLoading(false);

  const onStorage = (event) => {
    if (event.key !== null && event.key !== __localAuthInternals.SESSION_KEY) return;
    if (!mounted) return;
    hydrateFromSession(getStoredSession());
  };

  window.addEventListener('storage', onStorage);

  return () => {
    mounted = false;
    window.removeEventListener('storage', onStorage);
  };
}
