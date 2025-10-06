import { useCallback, useMemo, useState } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import { useAuth } from '../../../app/AuthContext.jsx';
import {
  updateVerificationRequestStatus,
} from '../../../../local-sim/admin/verification';
import { appendAdminLog } from '../../../../local-sim/admin/logs/index.js';
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
  const [visibleSections, setVisibleSections] = useState(() => ({
    pending: false,
    partial: false,
    rejected: false,
    approved: false,
  }));
  const [modalState, setModalState] = useState(() => ({
    show: false,
    requestId: null,
    intent: 'view',
  }));

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

  const openRequestModal = useCallback((request, intent = 'view') => {
    if (!request) return;
    setModalState({ show: true, requestId: request.id, intent });
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

  const displayError = actionError || error;

  const handleViewSection = useCallback(
    (sectionKey) => {
      if (!sectionKey) {
        return;
      }

      setVisibleSections((prev) => {
        if (prev[sectionKey]) {
          return prev;
        }

        return {
          ...prev,
          [sectionKey]: true,
        };
      });

      const sectionActionMap = {
        pending: 'Запросил просмотр очереди запросов на верификацию',
        partial: 'Запросил просмотр частично подтверждённых заявок на верификацию',
        rejected: 'Запросил просмотр отклонённых заявок на верификацию',
        approved: 'Запросил просмотр подтверждённых заявок на верификацию',
      };

      const action = sectionActionMap[sectionKey] ?? 'Запросил просмотр раздела верификации';

      try {
        appendAdminLog({
          section: 'verification',
          action,
          adminId: reviewer.id,
          adminName: reviewer.name,
          role: reviewer.role,
          context: `verification-view:${sectionKey}`,
        });
      } catch (err) {
        console.warn('Не удалось записать лог просмотра раздела верификации', err);
      }

      const maybePromise = ensureLoaded?.();
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => {});
      }
    },
    [ensureLoaded, reviewer],
  );

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
        onView={() => handleViewSection('pending')}
        onOpen={openRequestModal}
        busyId={busyId}
        isVisible={visibleSections.pending}
      />

      <VerificationPartialBlock
        requests={grouped.partial}
        loading={loading}
        onOpen={openRequestModal}
        busyId={busyId}
        onView={() => handleViewSection('partial')}
        isVisible={visibleSections.partial}
      />

      <VerificationRejectedBlock
        requests={grouped.rejected}
        loading={loading}
        onView={() => handleViewSection('rejected')}
        onOpen={openRequestModal}
        isVisible={visibleSections.rejected}
      />

      <VerificationApprovedBlock
        requests={grouped.approved}
        loading={loading}
        onView={() => handleViewSection('approved')}
        onOpen={openRequestModal}
        isVisible={visibleSections.approved}
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

