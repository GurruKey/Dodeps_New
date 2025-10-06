import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import { useAuth } from '../../../app/AuthContext.jsx';
import {
  updateVerificationRequestStatus,
} from '../../../../local-sim/admin/verification';
import { useAdminVerificationRequests } from './hooks/useAdminVerificationRequests.js';
import VerificationRequestsBlock from './blocks/VerificationRequestsBlock.jsx';
import VerificationPartialBlock from './blocks/VerificationPartialBlock.jsx';
import VerificationRejectedBlock from './blocks/VerificationRejectedBlock.jsx';
import VerificationApprovedBlock from './blocks/VerificationApprovedBlock.jsx';
import VerificationRequestModal from './components/VerificationRequestModal.jsx';
import {
  getAdminDisplayName,
  getAdminId,
  getAdminRole,
} from './utils.js';

export default function Verification() {
  const { requests, loading, error, reload, ensureLoaded } = useAdminVerificationRequests();
  const { user } = useAuth();
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [modalState, setModalState] = useState(() => ({
    show: false,
    requestId: null,
    intent: 'view',
  }));

  useEffect(() => {
    const maybePromise = ensureLoaded?.();
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => {});
    }
  }, [ensureLoaded]);

  const latestRequests = useMemo(() => {
    if (!Array.isArray(requests) || requests.length === 0) {
      return [];
    }

    const byUser = new Map();
    const getTimestamp = (entry) => {
      if (!entry) return 0;
      if (Number.isFinite(entry.sortTimestamp)) {
        return entry.sortTimestamp;
      }
      const candidates = [entry.updatedAt, entry.reviewedAt, entry.submittedAt];
      for (const value of candidates) {
        if (!value) continue;
        const parsed = Date.parse(value);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
      return 0;
    };

    requests.forEach((request) => {
      if (!request || typeof request !== 'object') {
        return;
      }

      const key = request.userId || request.id;
      if (!key) {
        return;
      }

      const current = byUser.get(key);
      if (!current || getTimestamp(request) >= getTimestamp(current)) {
        byUser.set(key, request);
      }
    });

    return Array.from(byUser.values()).sort((a, b) => getTimestamp(b) - getTimestamp(a));
  }, [requests]);

  const grouped = useMemo(() => {
    const byStatus = {
      pending: [],
      partial: [],
      rejected: [],
      approved: [],
    };

    latestRequests.forEach((request) => {
      if (!request) return;
      const bucket = byStatus[request.status] ?? byStatus.pending;
      bucket.push(request);
    });

    return byStatus;
  }, [latestRequests]);

  const activeRequest = useMemo(() => {
    if (!modalState.requestId) {
      return null;
    }

    const fromLatest = latestRequests.find((entry) => entry?.id === modalState.requestId);
    return fromLatest || null;
  }, [latestRequests, modalState.requestId]);

  const modalIntent = modalState.intent;

  const reviewer = useMemo(
    () => ({
      id: getAdminId(user),
      name: getAdminDisplayName(user),
      role: getAdminRole(user),
    }),
    [user],
  );

  const handleConfirm = useCallback(
    async (request, payload = {}) => {
      if (!request) return false;

      setActionError(null);
      setBusyId(request.id);

      try {
        await Promise.resolve(
          updateVerificationRequestStatus({
            requestId: request.id,
            status: 'approved',
            reviewer,
            notes: payload.notes,
            completedFields: payload.completedFields,
            requestedFields: payload.requestedFields,
            profilePatch: payload.profilePatch,
          }),
        );
        const maybePromise = ensureLoaded?.();
        if (maybePromise && typeof maybePromise.catch === 'function') {
          maybePromise.catch(() => {});
        }
        return true;
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error('Не удалось обновить статус запроса');
        setActionError(normalizedError);
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [ensureLoaded, reviewer],
  );

  const handleReject = useCallback(
    async (request, payload = {}) => {
      if (!request) return false;

      setActionError(null);
      setBusyId(request.id);

      try {
        await Promise.resolve(
          updateVerificationRequestStatus({
            requestId: request.id,
            status: 'rejected',
            reviewer,
            notes: payload.notes,
            completedFields: payload.completedFields,
            requestedFields: payload.requestedFields,
            profilePatch: payload.profilePatch,
          }),
        );
        const maybePromise = ensureLoaded?.();
        if (maybePromise && typeof maybePromise.catch === 'function') {
          maybePromise.catch(() => {});
        }
        return true;
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error('Не удалось обновить статус запроса');
        setActionError(normalizedError);
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [ensureLoaded, reviewer],
  );

  const openRequestModal = useCallback((request) => {
    if (!request) return;
    setModalState({ show: true, requestId: request.id, intent: 'view' });
  }, []);

  const closeRequestModal = useCallback(() => {
    if (busyId) {
      return;
    }
    setModalState({ show: false, requestId: null, intent: 'view' });
  }, [busyId]);

  const handleModalConfirm = useCallback(
    async (payload) => {
      if (!activeRequest) return;
      const ok = await handleConfirm(activeRequest, payload);
      if (ok) {
        setModalState({ show: false, requestId: null, intent: 'view' });
      }
    },
    [activeRequest, handleConfirm],
  );

  const handleModalReject = useCallback(
    async (payload) => {
      if (!activeRequest) return;
      const ok = await handleReject(activeRequest, payload);
      if (ok) {
        setModalState({ show: false, requestId: null, intent: 'view' });
      }
    },
    [activeRequest, handleReject],
  );

  const modalBusy = useMemo(() => {
    if (!busyId || !activeRequest) {
      return false;
    }
    return busyId === activeRequest.id;
  }, [activeRequest, busyId]);

  const displayError = actionError || error;

  return (
    <Stack gap={3}>
      {displayError && (
        <Alert variant="danger" className="mb-0">
          {displayError.message}
        </Alert>
      )}

      <VerificationRequestsBlock
        requests={grouped.pending}
        loading={loading}
        onReload={reload}
        onOpen={openRequestModal}
      />

      <VerificationPartialBlock
        requests={grouped.partial}
        loading={loading}
        onReload={reload}
        onOpen={openRequestModal}
      />

      <VerificationRejectedBlock
        requests={grouped.rejected}
        loading={loading}
        onReload={reload}
        onOpen={openRequestModal}
      />

      <VerificationApprovedBlock
        requests={grouped.approved}
        loading={loading}
        onReload={reload}
        onOpen={openRequestModal}
      />

      <VerificationRequestModal
        show={modalState.show && Boolean(activeRequest)}
        request={activeRequest}
        intent={modalIntent}
        onClose={closeRequestModal}
        onConfirm={handleModalConfirm}
        onReject={handleModalReject}
        busy={modalBusy}
      />
    </Stack>
  );
}

