import { useCallback, useEffect, useState } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import { PromoCodesHeader, PromoCodesTable, PromoDetailsPanel } from './blocks/index.js';
import {
  archiveAdminPromocode,
  extendAdminPromocodeEndsAt,
  listAdminPromocodes,
  pauseAdminPromocode,
  resumeAdminPromocode,
  subscribeToAdminPromocodes,
} from '../../../../../../local-sim/modules/promo/index.js';
import './promocodes.css';

export default function PromoCodes() {
  const [promocodes, setPromocodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [isActionPending, setIsActionPending] = useState(false);
  const [actionError, setActionError] = useState(null);

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

  useEffect(() => {
    if (!promocodes.length) {
      setSelectedId(null);
      setSelectedPromo(null);
      return;
    }

    if (!selectedId) return;

    const existing = promocodes.find((promo) => promo.id === selectedId);
    if (existing) {
      setSelectedPromo(existing);
      return;
    }

    setSelectedId(null);
    setSelectedPromo(null);
  }, [promocodes, selectedId]);

  const applyUpdatedPromo = useCallback((updated) => {
    if (!updated) return;
    setPromocodes((prev) => {
      const list = Array.isArray(prev) ? [...prev] : [];
      if (updated.status === 'archived') {
        return list.filter((promo) => promo.id !== updated.id);
      }
      const index = list.findIndex((promo) => promo.id === updated.id);
      if (index === -1) {
        list.push(updated);
      } else {
        list[index] = updated;
      }
      return list;
    });

    if (updated.status === 'archived') {
      setSelectedId((currentId) => (currentId === updated.id ? null : currentId));
      setSelectedPromo((current) => (current?.id === updated.id ? null : current));
    } else {
      setSelectedId(updated.id);
      setSelectedPromo(updated);
    }
  }, []);

  const runAction = useCallback(
    (operation) => {
      setIsActionPending(true);
      setActionError(null);
      try {
        const updated = operation();
        applyUpdatedPromo(updated);
      } catch (err) {
        const message = err instanceof Error ? err : new Error('Не удалось обновить промокод');
        setActionError(message);
      } finally {
        setIsActionPending(false);
      }
    },
    [applyUpdatedPromo],
  );

  const handleSelectPromo = useCallback((promo) => {
    setSelectedId(promo?.id ?? null);
    setSelectedPromo(promo ?? null);
  }, []);

  useEffect(() => {
    setActionError(null);
  }, [selectedId]);

  const handleCloseDetails = useCallback(() => {
    setSelectedId(null);
    setSelectedPromo(null);
  }, []);

  const handlePause = useCallback((id) => runAction(() => pauseAdminPromocode(id)), [runAction]);
  const handleResume = useCallback((id) => runAction(() => resumeAdminPromocode(id)), [runAction]);
  const handleArchive = useCallback(
    (id) =>
      runAction(() => {
        return archiveAdminPromocode(id);
      }),
    [runAction],
  );
  const handleExtend = useCallback(
    (id) => runAction(() => extendAdminPromocodeEndsAt(id, { hours: 24 })),
    [runAction],
  );

  return (
    <Stack gap={3}>
      <PromoCodesHeader isLoading={isLoading} onReload={handleReload} />
      {error && (
        <Alert variant="danger" className="mb-0">
          {error.message}
        </Alert>
      )}
      <PromoCodesTable
        promocodes={promocodes}
        isLoading={isLoading}
        onSelect={handleSelectPromo}
        selectedId={selectedId}
      />
      <PromoDetailsPanel
        promo={selectedPromo}
        show={Boolean(selectedPromo)}
        onClose={handleCloseDetails}
        onPause={handlePause}
        onResume={handleResume}
        onArchive={handleArchive}
        onExtend={handleExtend}
        isActionPending={isActionPending}
        actionError={actionError}
      />
    </Stack>
  );
}
