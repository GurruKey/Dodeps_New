import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../layout/index.js';
import { listClients } from '@local-sim/modules/clients/index.js';

export default function AdminPage() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClients = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listClients(signal ? { signal } : undefined);
      if (!signal?.aborted) {
        setClients(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка загрузки клиентов'));
      setClients([]);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadClients(controller.signal);
    return () => controller.abort();
  }, [loadClients]);

  const handleReload = useCallback(() => {
    loadClients();
  }, [loadClients]);

  return (
    <AdminLayout
      clients={clients}
      isLoading={isLoading}
      error={error}
      onReload={handleReload}
    />
  );
}
