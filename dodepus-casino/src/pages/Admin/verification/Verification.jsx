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
import {
  getAdminDisplayName,
  getAdminId,
  getAdminRole,
} from './utils.js';

export default function Verification() {
  const { requests, loading, error, reload } = useAdminVerificationRequests();
  const { user } = useAuth();
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const grouped = useMemo(() => {
    const byStatus = {
      pending: [],
      partial: [],
      rejected: [],
      approved: [],
    };

    requests.forEach((request) => {
      if (!request) return;
      const bucket = byStatus[request.status] ?? byStatus.pending;
      bucket.push(request);
    });

    return byStatus;
  }, [requests]);

  const reviewer = useMemo(
    () => ({
      id: getAdminId(user),
      name: getAdminDisplayName(user),
      role: getAdminRole(user),
    }),
    [user],
  );

  const handleConfirm = useCallback(
    async (request) => {
      if (!request) return;

      setActionError(null);
      setBusyId(request.id);

      const nextStatus = request.completedCount >= request.totalFields ? 'approved' : 'partial';

      try {
        await Promise.resolve(
          updateVerificationRequestStatus({
            requestId: request.id,
            status: nextStatus,
            reviewer,
          }),
        );
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error('Не удалось обновить статус запроса');
        setActionError(normalizedError);
      } finally {
        setBusyId(null);
      }
    },
    [reviewer],
  );

  const handleReject = useCallback(
    async (request) => {
      if (!request) return;

      setActionError(null);
      setBusyId(request.id);

      try {
        await Promise.resolve(
          updateVerificationRequestStatus({
            requestId: request.id,
            status: 'rejected',
            reviewer,
          }),
        );
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error('Не удалось обновить статус запроса');
        setActionError(normalizedError);
      } finally {
        setBusyId(null);
      }
    },
    [reviewer],
  );

  const displayError = actionError || error;

  const handleViewSection = useCallback(
    (sectionKey) => {
      if (!sectionKey) {
        return;
      }

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

      const maybePromise = reload?.();
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => {});
      }
    },
    [reload, reviewer],
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
        onConfirm={handleConfirm}
        onReject={handleReject}
        busyId={busyId}
      />

      <VerificationPartialBlock
        requests={grouped.partial}
        loading={loading}
        onConfirm={handleConfirm}
        onReject={handleReject}
        busyId={busyId}
        onView={() => handleViewSection('partial')}
      />

      <VerificationRejectedBlock
        requests={grouped.rejected}
        loading={loading}
        onView={() => handleViewSection('rejected')}
      />

      <VerificationApprovedBlock
        requests={grouped.approved}
        loading={loading}
        onView={() => handleViewSection('approved')}
      />
    </Stack>
  );
}

