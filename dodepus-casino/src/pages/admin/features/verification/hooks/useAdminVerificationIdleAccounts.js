import { useCallback, useEffect, useRef, useState } from 'react';
import { listAdminVerificationIdleAccounts } from '../../../../../../local-sim/modules/verification/api.js';

export function useAdminVerificationIdleAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const isMountedRef = useRef(true);
  const activeRequestsRef = useRef(0);
  const controllerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      controllerRef.current?.abort?.();
    };
  }, []);

  const loadAccounts = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    controllerRef.current?.abort?.();
    const controller = new AbortController();
    controllerRef.current = controller;

    activeRequestsRef.current += 1;
    setLoading(true);
    setError(null);

    try {
      const data = await listAdminVerificationIdleAccounts({ signal: controller.signal });
      if (!isMountedRef.current) {
        return;
      }

      setAccounts(Array.isArray(data) ? data : []);
      setError(null);
      setLoaded(true);
    } catch (err) {
      if (!isMountedRef.current) {
        return;
      }

      if (err?.name === 'AbortError') {
        return;
      }

      const normalizedError =
        err instanceof Error
          ? err
          : new Error('Не удалось загрузить аккаунты без заявок на верификацию');
      setError(normalizedError);
    } finally {
      const isMounted = isMountedRef.current;

      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      if (isMounted) {
        activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1);
        if (activeRequestsRef.current === 0) {
          setLoading(false);
        }
      } else {
        activeRequestsRef.current = 0;
      }
    }
  }, []);

  const ensureLoaded = useCallback(() => {
    if (loaded) {
      return Promise.resolve();
    }

    return loadAccounts();
  }, [loadAccounts, loaded]);

  const reload = useCallback(() => loadAccounts(), [loadAccounts]);

  return { accounts, loading, error, ensureLoaded, reload };
}
