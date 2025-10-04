import { useCallback, useEffect, useState } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import PromoCodesHeader from './blocks/PromoCodesHeader.jsx';
import PromoCodesTable from './blocks/PromoCodesTable.jsx';
import { listAdminPromocodes, subscribeToAdminPromocodes } from '../../../../local-sim/admin/promocodes';

export default function PromoCodes() {
  const [promocodes, setPromocodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPromocodes = useCallback(
    async (signal) => {
      const abortSignal = (() => {
        if (!signal) return undefined;
        if (typeof AbortSignal !== 'undefined' && signal instanceof AbortSignal) {
          return signal;
        }
        if (typeof signal === 'object' && 'aborted' in signal) {
          return signal;
        }
        if (typeof signal === 'object' && 'signal' in signal) {
          const candidate = signal.signal;
          if (typeof AbortSignal !== 'undefined' && candidate instanceof AbortSignal) {
            return candidate;
          }
          if (typeof candidate === 'object' && 'aborted' in candidate) {
            return candidate;
          }
        }
        return undefined;
      })();
      if (!abortSignal?.aborted) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await listAdminPromocodes(abortSignal ? { signal: abortSignal } : undefined);
        if (!abortSignal?.aborted) {
          setPromocodes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (abortSignal?.aborted) return;
        const message = err instanceof Error ? err : new Error('Не удалось загрузить промокоды');
        setPromocodes([]);
        setError(message);
      } finally {
        if (!abortSignal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadPromocodes(controller.signal);
    return () => controller.abort();
  }, [loadPromocodes]);

  useEffect(() => {
    const unsubscribe = subscribeToAdminPromocodes(() => {
      loadPromocodes();
    });
    return unsubscribe;
  }, [loadPromocodes]);

  const handleReload = useCallback(() => {
    loadPromocodes();
  }, [loadPromocodes]);

  return (
    <Stack gap={3}>
      <PromoCodesHeader isLoading={isLoading} onReload={handleReload} />
      {error && (
        <Alert variant="danger" className="mb-0">
          {error.message}
        </Alert>
      )}
      <PromoCodesTable promocodes={promocodes} isLoading={isLoading} />
    </Stack>
  );
}
