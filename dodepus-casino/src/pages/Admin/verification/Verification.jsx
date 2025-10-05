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

      const completedFields =
        request?.completedFields && typeof request.completedFields === 'object'
          ? request.completedFields
          : {};
      const requestedFields =
        request?.requestedFields && typeof request.requestedFields === 'object'
          ? request.requestedFields
          : {};

      const completedTrueCount = Object.values(completedFields).filter(Boolean).length;
      const outstandingRequestedCount = Object.entries(requestedFields).reduce(
        (total, [key, isRequested]) => {
          if (!isRequested) {
            return total;
          }
          return completedFields[key] ? total : total + 1;
        },
        0,
      );

      const relevantKeys = new Set([
        ...Object.entries(completedFields)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key),
        ...Object.entries(requestedFields)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key),
      ]);

      const relevantTotal = relevantKeys.size || completedTrueCount + outstandingRequestedCount;
      const nextCompletedCount = Math.min(
        relevantTotal,
        completedTrueCount + outstandingRequestedCount,
      );

      const nextStatus =
        relevantTotal === 0 || nextCompletedCount >= relevantTotal ? 'approved' : 'partial';

      try {
        await Promise.resolve(
          updateVerificationRequestStatus({
            requestId: request.id,
            status: nextStatus,
            reviewer,
          }),
        );
        const maybePromise = ensureLoaded?.();
        if (maybePromise && typeof maybePromise.catch === 'function') {
          maybePromise.catch(() => {});
        }
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error('Не удалось обновить статус запроса');
        setActionError(normalizedError);
      } finally {
        setBusyId(null);
      }
    },
    [ensureLoaded, reviewer],
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
        const maybePromise = ensureLoaded?.();
        if (maybePromise && typeof maybePromise.catch === 'function') {
          maybePromise.catch(() => {});
        }
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error('Не удалось обновить статус запроса');
        setActionError(normalizedError);
      } finally {
        setBusyId(null);
      }
    },
    [ensureLoaded, reviewer],
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
        onConfirm={handleConfirm}
        onReject={handleReject}
        busyId={busyId}
        isVisible={visibleSections.pending}
      />

      <VerificationPartialBlock
        requests={grouped.partial}
        loading={loading}
        onConfirm={handleConfirm}
        onReject={handleReject}
        busyId={busyId}
        onView={() => handleViewSection('partial')}
        isVisible={visibleSections.partial}
      />

      <VerificationRejectedBlock
        requests={grouped.rejected}
        loading={loading}
        onView={() => handleViewSection('rejected')}
        isVisible={visibleSections.rejected}
      />

      <VerificationApprovedBlock
        requests={grouped.approved}
        loading={loading}
        onView={() => handleViewSection('approved')}
        isVisible={visibleSections.approved}
      />
    </Stack>
  );
}

