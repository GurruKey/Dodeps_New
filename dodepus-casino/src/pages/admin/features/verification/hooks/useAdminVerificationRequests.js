import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listAdminVerificationRequests,
  subscribeToAdminVerificationRequests,
} from '../../../../../../local-sim/modules/verification/index.js';

const STORAGE_KEY_PREFIX = 'dodepus_profile_v1:';

export function useAdminVerificationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const isMountedRef = useRef(true);
  const activeRequestsRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadRequests = useCallback(
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
        const data = await listAdminVerificationRequests({ signal });
        if (!isMountedRef.current) {
          return;
        }

        setRequests(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) {
          return;
        }

        if (err?.name !== 'AbortError') {
          const normalizedError =
            err instanceof Error
              ? err
              : new Error('Не удалось загрузить запросы на верификацию');
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
    if (!initialized) {
      return () => {};
    }

    const unsubscribe = subscribeToAdminVerificationRequests(() => {
      loadRequests({ showLoader: false }).catch(() => {});
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

      loadRequests({ showLoader: false }).catch(() => {});
    };

    target.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      target.removeEventListener('storage', handleStorage);
    };
  }, [initialized, loadRequests]);

  const startLoading = useCallback(
    async (options = {}) => {
      if (!initialized) {
        setInitialized(true);
      }

      const showLoader = options?.showLoader ?? true;

      return loadRequests({ ...options, showLoader });
    },
    [initialized, loadRequests],
  );

  const ensureLoaded = useCallback(() => startLoading(), [startLoading]);
  const reload = useCallback(() => startLoading(), [startLoading]);

  return { requests, loading, error, reload, ensureLoaded, initialized };
}
