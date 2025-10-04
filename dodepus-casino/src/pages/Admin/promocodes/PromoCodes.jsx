import { useCallback, useEffect, useState } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import PromoCodesHeader from './blocks/PromoCodesHeader.jsx';
import PromoCodesTable from './blocks/PromoCodesTable.jsx';
import PromoDetailsPanel from './blocks/PromoDetailsPanel.jsx';
import {
  archiveAdminPromocode,
  extendAdminPromocodeEndsAt,
  listAdminPromocodes,
  pauseAdminPromocode,
  resumeAdminPromocode,
  subscribeToAdminPromocodes,
} from '../../../../local-sim/admin/promocodes';
import './promocodes.css';

export default function PromoCodes() {
  const [promocodes, setPromocodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [autoSelectEnabled, setAutoSelectEnabled] = useState(true);
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
    setAutoSelectEnabled(true);
    loadPromocodes();
  }, [loadPromocodes]);

  useEffect(() => {
    if (!promocodes.length) {
      setSelectedId(null);
      setSelectedPromo(null);
      return;
    }

    if (selectedId) {
      const existing = promocodes.find((promo) => promo.id === selectedId);
      if (existing) {
        setSelectedPromo(existing);
        return;
      }
      if (!autoSelectEnabled) {
        setSelectedId(null);
        setSelectedPromo(null);
        return;
      }
    }

    if (autoSelectEnabled) {
      const first = promocodes[0];
      setSelectedId(first?.id ?? null);
      setSelectedPromo(first ?? null);
    }
  }, [promocodes, selectedId, autoSelectEnabled]);

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
      setSelectedId(null);
      setSelectedPromo(null);
      setAutoSelectEnabled(true);
    } else {
      setSelectedId(updated.id);
      setSelectedPromo(updated);
      setAutoSelectEnabled(true);
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
    setAutoSelectEnabled(true);
  }, []);

  useEffect(() => {
    setActionError(null);
  }, [selectedId]);

  const handleCloseDetails = useCallback(() => {
    setSelectedId(null);
    setSelectedPromo(null);
    setAutoSelectEnabled(false);
  }, []);

  const handlePause = useCallback((id) => runAction(() => pauseAdminPromocode(id)), [runAction]);
  const handleResume = useCallback((id) => runAction(() => resumeAdminPromocode(id)), [runAction]);
  const handleArchive = useCallback(
    (id) =>
      runAction(() => {
        const archived = archiveAdminPromocode(id);
        setAutoSelectEnabled(true);
        return archived;
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
      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <PromoCodesTable
            promocodes={promocodes}
            isLoading={isLoading}
            onSelect={handleSelectPromo}
            selectedId={selectedId}
          />
        </div>
        <div className="col-12 col-xl-6">
          {selectedPromo && (
            <PromoDetailsPanel
              promo={selectedPromo}
              onClose={handleCloseDetails}
              onPause={handlePause}
              onResume={handleResume}
              onArchive={handleArchive}
              onExtend={handleExtend}
              isActionPending={isActionPending}
              actionError={actionError}
            />
          )}
        </div>
      </div>
    </Stack>
  );
}
