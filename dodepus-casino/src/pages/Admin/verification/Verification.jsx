import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Stack, Form } from 'react-bootstrap';
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
  getUserDisplayName,
} from './utils.js';
import {
  deriveModuleStatesFromRequests,
  summarizeModuleStates,
  VERIFICATION_MODULES,
} from '../../../shared/verification/index.js';

const parseTimestamp = (value) => {
  if (!value) return 0;
  try {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
};

const getRequestSortTimestamp = (request) => {
  if (!request) return 0;
  if (Number.isFinite(request.sortTimestamp)) {
    return request.sortTimestamp;
  }

  const candidates = [request.updatedAt, request.reviewedAt, request.submittedAt];
  for (const value of candidates) {
    const ts = parseTimestamp(value);
    if (ts) {
      return ts;
    }
  }

  return 0;
};

const buildUserEntries = (rawRequests = []) => {
  const byUser = new Map();

  rawRequests.forEach((request) => {
    if (!request || typeof request !== 'object') {
      return;
    }

    const userId = request.userId || request.id;
    if (!userId) {
      return;
    }

    if (!byUser.has(userId)) {
      byUser.set(userId, []);
    }
    byUser.get(userId).push(request);
  });

  return Array.from(byUser.entries()).map(([userId, userRequests]) => {
    const modulesMap = deriveModuleStatesFromRequests(userRequests);
    const summary = summarizeModuleStates(modulesMap);
    const sorted = userRequests
      .slice()
      .sort((a, b) => getRequestSortTimestamp(b) - getRequestSortTimestamp(a));

    const findByStatus = (status) => sorted.find((request) => request?.status === status) || null;

    const pendingRequest = findByStatus('pending');
    const partialRequest = findByStatus('partial');
    const rejectedRequest = findByStatus('rejected');
    const approvedRequest = findByStatus('approved');
    const latestRequest = sorted[0] || null;

    const primaryRequest =
      pendingRequest || partialRequest || rejectedRequest || approvedRequest || latestRequest;

    const baseRequest = primaryRequest || latestRequest || null;
    const normalizedUserId = baseRequest?.userId || userId || '';
    const displayName = getUserDisplayName(baseRequest || { userId: normalizedUserId });

    const searchIndex = [
      normalizedUserId,
      displayName,
      baseRequest?.userEmail,
      baseRequest?.userPhone,
      baseRequest?.profile?.firstName,
      baseRequest?.profile?.lastName,
      baseRequest?.profile?.nickname,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
      .join(' ');

    const modules = VERIFICATION_MODULES.map((module) => ({
      key: module.key,
      label: module.label,
      status: modulesMap[module.key]?.status || 'idle',
    }));

    const attachmentsCount = Array.isArray(primaryRequest?.attachments)
      ? primaryRequest.attachments.length
      : 0;

    const section = summary.hasPending
      ? 'requests'
      : summary.hasRejected
        ? 'rejected'
        : summary.allApproved
          ? 'verified'
          : 'partial';

    const sortTimestamp = Math.max(
      summary.latestTimestamp || 0,
      ...sorted.map((request) => getRequestSortTimestamp(request)),
    );

    return {
      userId: normalizedUserId,
      displayName,
      modules,
      modulesMap,
      summary,
      attachmentsCount,
      primaryRequest,
      pendingRequest,
      partialRequest,
      rejectedRequest,
      approvedRequest,
      latestRequest,
      sortTimestamp,
      searchIndex,
      section,
      submittedAt: primaryRequest?.submittedAt || '',
      updatedAt: primaryRequest?.updatedAt || '',
      reviewedAt: primaryRequest?.reviewedAt || '',
      reviewer: primaryRequest?.reviewer || {},
      status: primaryRequest?.status || '',
    };
  });
};

export default function Verification() {
  const { requests, loading, error, reload, ensureLoaded } = useAdminVerificationRequests();
  const { user } = useAuth();
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const createInitialModalState = useCallback(
    () => ({
      show: false,
      requestId: null,
      defaultMode: 'view',
      moduleKey: null,
      moduleStatus: null,
    }),
    [],
  );
  const [modalState, setModalState] = useState(() => createInitialModalState());
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const maybePromise = ensureLoaded?.();
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => {});
    }
  }, [ensureLoaded]);

  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();

  const userEntries = useMemo(
    () => buildUserEntries(Array.isArray(requests) ? requests : []),
    [requests],
  );

  const filteredEntries = useMemo(() => {
    if (!normalizedSearch) {
      return userEntries;
    }
    return userEntries.filter((entry) => entry.searchIndex.includes(normalizedSearch));
  }, [userEntries, normalizedSearch]);

  const grouped = useMemo(() => {
    const buckets = {
      requests: [],
      partial: [],
      rejected: [],
      verified: [],
    };

    filteredEntries.forEach((entry) => {
      buckets[entry.section].push(entry);
    });

    Object.values(buckets).forEach((items) => {
      items.sort((a, b) => (b.sortTimestamp || 0) - (a.sortTimestamp || 0));
    });

    return buckets;
  }, [filteredEntries]);

  const activeRequest = useMemo(() => {
    if (!modalState.requestId) {
      return null;
    }

    if (!Array.isArray(requests)) {
      return null;
    }

    return requests.find((entry) => entry?.id === modalState.requestId) || null;
  }, [requests, modalState.requestId]);

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

  const openRequestModal = useCallback(
    (request, options = {}) => {
      if (!request) return;
      const nextMode = (() => {
        if (options.defaultMode) {
          return options.defaultMode;
        }
        return request.status === 'pending' ? 'approve' : 'view';
      })();

      setModalState({
        show: true,
        requestId: request.id,
        defaultMode: nextMode,
        moduleKey: options.moduleKey || null,
        moduleStatus: options.moduleStatus || null,
      });
    },
    [],
  );

  const closeRequestModal = useCallback(() => {
    if (busyId) {
      return;
    }
    setModalState(createInitialModalState());
  }, [busyId, createInitialModalState]);

  const handleModalConfirm = useCallback(
    async (payload) => {
      if (!activeRequest) return;
      const ok = await handleConfirm(activeRequest, payload);
      if (ok) {
        setModalState(createInitialModalState());
      }
    },
    [activeRequest, handleConfirm, createInitialModalState],
  );

  const handleModalReject = useCallback(
    async (payload) => {
      if (!activeRequest) return;
      const ok = await handleReject(activeRequest, payload);
      if (ok) {
        setModalState(createInitialModalState());
      }
    },
    [activeRequest, handleReject, createInitialModalState],
  );

  const toggleSection = useCallback((section) => {
    setExpandedSection((current) => (current === section ? null : section));
  }, []);

  const handleOpenEntry = useCallback(
    (entry) => {
      if (!entry) return;
      const request =
        entry.primaryRequest || entry.pendingRequest || entry.latestRequest || null;
      if (!request) {
        return;
      }
      openRequestModal(request, {
        defaultMode: request.status === 'pending' ? 'approve' : 'view',
      });
    },
    [openRequestModal],
  );

  const handleOpenModule = useCallback(
    (entry, module) => {
      if (!entry || !module) {
        return;
      }
      const request =
        entry.primaryRequest || entry.pendingRequest || entry.latestRequest || null;
      if (!request) {
        return;
      }

      const moduleStatus = module.status || 'idle';
      const defaultMode =
        request.status === 'pending' && moduleStatus !== 'approved' ? 'approve' : 'view';

      openRequestModal(request, {
        defaultMode,
        moduleKey: module.key || null,
        moduleStatus,
      });
    },
    [openRequestModal],
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

      <Form className="mb-0" onSubmit={(event) => event.preventDefault()}>
        <Form.Control
          type="search"
          placeholder="Поиск по ID, почте, телефону или имени"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Form>

      <VerificationRequestsBlock
        requests={grouped.requests}
        loading={loading}
        onReload={reload}
        onOpen={handleOpenEntry}
        onOpenModule={handleOpenModule}
        expanded={expandedSection === 'requests'}
        onToggle={() => toggleSection('requests')}
      />

      <VerificationPartialBlock
        requests={grouped.partial}
        loading={loading}
        onReload={reload}
        onOpen={handleOpenEntry}
        onOpenModule={handleOpenModule}
        expanded={expandedSection === 'partial'}
        onToggle={() => toggleSection('partial')}
      />

      <VerificationRejectedBlock
        requests={grouped.rejected}
        loading={loading}
        onReload={reload}
        onOpen={handleOpenEntry}
        onOpenModule={handleOpenModule}
        expanded={expandedSection === 'rejected'}
        onToggle={() => toggleSection('rejected')}
      />

      <VerificationApprovedBlock
        requests={grouped.verified}
        loading={loading}
        onReload={reload}
        onOpen={handleOpenEntry}
        onOpenModule={handleOpenModule}
        expanded={expandedSection === 'verified'}
        onToggle={() => toggleSection('verified')}
      />

      <VerificationRequestModal
        show={modalState.show && Boolean(activeRequest)}
        request={activeRequest}
        onClose={closeRequestModal}
        onConfirm={handleModalConfirm}
        onReject={handleModalReject}
        busy={modalBusy}
        defaultMode={modalState.defaultMode}
        focusModule={modalState.moduleKey}
        focusStatus={modalState.moduleStatus}
      />
    </Stack>
  );
}

