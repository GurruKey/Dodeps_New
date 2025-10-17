import { useCallback, useEffect, useRef, useState } from 'react';

import {
  listAdminTransactions,
  subscribeToAdminTransactions,
} from '../../../../../../local-sim/modules/transactions/index.js';

const STORAGE_KEY_PREFIX = 'dodepus_profile_v1:';

export function useAdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activated, setActivated] = useState(false);
  const isMountedRef = useRef(true);
  const activeRequestsRef = useRef(0);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadTransactions = useCallback(
    async ({ signal, showLoader = true } = {}) => {
      if (!isMountedRef.current) {
        return;
      }

      if (showLoader) {
        activeRequestsRef.current += 1;
        setLoading(true);
        setError(null);
      }

      try {
        const data = await listAdminTransactions({ signal });
        if (!isMountedRef.current) {
          return;
        }

        setTransactions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) {
          return;
        }

        if (err?.name !== 'AbortError') {
          const normalizedError =
            err instanceof Error ? err : new Error('Не удалось загрузить транзакции');
          setError(normalizedError);
        }
      } finally {
        if (!isMountedRef.current) {
          activeRequestsRef.current = 0;
        } else if (showLoader) {
          activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1);
          if (activeRequestsRef.current === 0) {
            setLoading(false);
          }
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!activated) {
      return undefined;
    }

    const controller = new AbortController();
    loadTransactions({ signal: controller.signal, showLoader: true }).catch(() => {});

    return () => {
      controller.abort();
    };
  }, [activated, loadTransactions]);

  useEffect(() => {
    if (!activated) {
      return undefined;
    }

    const unsubscribe = subscribeToAdminTransactions(() => {
      loadTransactions({ showLoader: false }).catch(() => {});
    });

    const target = typeof window !== 'undefined' ? window : null;
    if (!target?.addEventListener) {
      return () => {
        unsubscribe();
      };
    }

    const handleStorage = (event) => {
      if (typeof event?.key !== 'string') {
        return;
      }

      if (!event.key.startsWith(STORAGE_KEY_PREFIX)) {
        return;
      }

      loadTransactions({ showLoader: false }).catch(() => {});
    };

    target.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      target.removeEventListener('storage', handleStorage);
    };
  }, [activated, loadTransactions]);

  const activate = useCallback(() => {
    if (activated) {
      return loadTransactions({ showLoader: true });
    }

    setActivated(true);
    return Promise.resolve();
  }, [activated, loadTransactions]);

  const reload = useCallback(() => {
    if (!activated) {
      setActivated(true);
      return Promise.resolve();
    }

    return loadTransactions({ showLoader: true });
  }, [activated, loadTransactions]);

  return { transactions, loading, error, reload, activate, isActivated: activated };
}
