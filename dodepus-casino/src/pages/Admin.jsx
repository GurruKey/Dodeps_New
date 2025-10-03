import { useCallback, useEffect, useState } from 'react';
import AdminLayout from './Admin/AdminLayout.jsx';
import { listClients } from '../../local-sim/admin/clients';

export default function Admin() {
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
