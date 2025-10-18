import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  listAdminLogs,
  listAdminLogSections,
  listAdminLogRoleOptions,
} from '@local-sim/modules/logs/index.js';

const normalizeLogs = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((log) => Boolean(log && typeof log === 'object'));
};

export function useAdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const data = await listAdminLogs({ signal });
      if (signal?.aborted) return;
      setLogs(normalizeLogs(data));
    } catch (err) {
      if (signal?.aborted) return;
      setLogs([]);
      setError(err instanceof Error ? err : new Error('Не удалось получить логи'));
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchLogs(controller.signal);
    return () => controller.abort();
  }, [fetchLogs]);

  const reload = useCallback(() => {
    const controller = new AbortController();
    fetchLogs(controller.signal);
    return controller;
  }, [fetchLogs]);

  const sectionOptions = useMemo(() => listAdminLogSections(), []);
  const roleOptions = useMemo(() => listAdminLogRoleOptions(), []);

  return {
    logs,
    loading,
    error,
    reload,
    sectionOptions,
    roleOptions,
  };
}
