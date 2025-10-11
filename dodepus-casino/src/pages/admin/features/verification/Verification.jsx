import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Stack, Form } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../../app/AuthContext.jsx';
import {
  updateVerificationRequestStatus,
  resetVerificationRequestModules,
} from '../../../../../local-sim/api/verification.js';
import { useAdminVerificationRequests } from './hooks/useAdminVerificationRequests.js';
import VerificationRequestsBlock from './blocks/VerificationRequestsBlock.jsx';
import VerificationPartialBlock from './blocks/VerificationPartialBlock.jsx';
import VerificationRejectedBlock from './blocks/VerificationRejectedBlock.jsx';
import VerificationApprovedBlock from './blocks/VerificationApprovedBlock.jsx';
import VerificationRequestModal from './components/VerificationRequestModal.jsx';
import VerificationIdleAccountsModal from './components/VerificationIdleAccountsModal.jsx';
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
} from '../../../../shared/verification/index.js';
import { useAdminVerificationIdleAccounts } from './hooks/useAdminVerificationIdleAccounts.js';

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

const buildRequestEntries = (rawRequests = []) => {
  const entries = [];

  rawRequests.forEach((request) => {
    if (!request || typeof request !== 'object') {
      return;
    }

    const modulesMap = deriveModuleStatesFromRequests([request]);
    const summary = summarizeModuleStates(modulesMap);
    const attachmentsCount = Array.isArray(request.attachments) ? request.attachments.length : 0;
    const normalizedUserId = request.userId || request.id || '';
    const displayName = getUserDisplayName(request || { userId: normalizedUserId });

    const searchIndex = [
      request.id,
      normalizedUserId,
      displayName,
      request.userEmail,
      request.userPhone,
      request?.profile?.firstName,
      request?.profile?.lastName,
      request?.profile?.nickname,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
      .join(' ');

    const modules = VERIFICATION_MODULES.map((module) => ({
      key: module.key,
      label: module.label,
      status: modulesMap[module.key]?.status || 'idle',
    }));

    const section = summary.hasPending
      ? 'requests'
      : summary.hasRejected
        ? 'rejected'
        : summary.allApproved
          ? 'verified'
          : 'partial';

    entries.push({
      userId: normalizedUserId,
      displayName,
      requestId: request.id || '',
      modules,
      modulesMap,
      summary,
      attachmentsCount,
      primaryRequest: request,
      pendingRequest: request.status === 'pending' ? request : null,
      rejectedRequest: request.status === 'rejected' ? request : null,
      approvedRequest: request.status === 'approved' ? request : null,
      idleRequest: request.status === 'idle' ? request : null,
      latestRequest: request,
      sortTimestamp: getRequestSortTimestamp(request),
      searchIndex,
      section,
      submittedAt: request.submittedAt || '',
      updatedAt: request.updatedAt || '',
      reviewedAt: request.reviewedAt || '',
      reviewer: request.reviewer || {},
      status: request.status || '',
    });
  });

  entries.sort((a, b) => (b.sortTimestamp || 0) - (a.sortTimestamp || 0));
  return entries;
};

export default function Verification() {
  const { requests, loading, error, reload, ensureLoaded } = useAdminVerificationRequests();
  const {
    accounts: idleAccounts,
    loading: idleAccountsLoading,
    error: idleAccountsError,
    ensureLoaded: ensureIdleAccountsLoaded,
    reload: reloadIdleAccounts,
  } = useAdminVerificationIdleAccounts();
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
  const [idleModalShown, setIdleModalShown] = useState(false);

  useEffect(() => {
    const maybePromise = ensureLoaded?.();
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => {});
    }
  }, [ensureLoaded]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const normalizedSearch = searchQuery.trim().toLowerCase();

  useEffect(() => {
    const paramValue = searchParams.get('q') || '';
    setSearchInput((current) => (current === paramValue ? current : paramValue));
    setSearchQuery((current) => (current === paramValue ? current : paramValue));
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);

      const nextQuery = searchInput.trim();
      const currentQuery = searchParams.get('q') || '';
      const hasParam = searchParams.has('q');

      if (nextQuery === currentQuery) {
        if ((nextQuery && hasParam) || (!nextQuery && !hasParam)) {
          return;
        }
      }

      const nextParams = new URLSearchParams(searchParams);
      if (nextQuery) {
        nextParams.set('q', nextQuery);
      } else {
        nextParams.delete('q');
      }

      setSearchParams(nextParams, { replace: true });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, searchParams, setSearchParams]);

  const requestEntries = useMemo(
    () => buildRequestEntries(Array.isArray(requests) ? requests : []),
    [requests],
  );

  const filteredEntries = useMemo(() => {
    if (!normalizedSearch) {
      return requestEntries;
    }
    return requestEntries.filter((entry) => entry.searchIndex.includes(normalizedSearch));
  }, [requestEntries, normalizedSearch]);

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
        if (request.status === 'pending') {
          return 'approve';
        }
        if (request.status === 'approved') {
          return 'view';
        }
        return 'view';
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

  const handleModalReset = useCallback(
    async (payload) => {
      if (!activeRequest) return;

      setActionError(null);
      setBusyId(activeRequest.id);

      try {
        await Promise.resolve(
          resetVerificationRequestModules({
            requestId: activeRequest.id,
            modules: payload.modules,
            notes: payload.notes,
            reviewer,
          }),
        );
        const maybePromise = ensureLoaded?.();
        if (maybePromise && typeof maybePromise.catch === 'function') {
          maybePromise.catch(() => {});
        }
        setModalState(createInitialModalState());
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error('Не удалось сбросить статусы модулей');
        setActionError(normalizedError);
      } finally {
        setBusyId(null);
      }
    },
    [activeRequest, reviewer, ensureLoaded, createInitialModalState],
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

  const handleOpenReset = useCallback(
    (entry) => {
      if (!entry) return;
      const request = entry.primaryRequest || entry.latestRequest || entry.approvedRequest || null;
      if (!request) {
        return;
      }
      openRequestModal(request, {
        defaultMode: 'reset',
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

  const openIdleAccountsModal = useCallback(() => {
    setIdleModalShown(true);
    const maybePromise = ensureIdleAccountsLoaded?.();
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => {});
    }
  }, [ensureIdleAccountsLoaded]);

  const closeIdleAccountsModal = useCallback(() => {
    setIdleModalShown(false);
  }, []);

  const handleReloadIdleAccounts = useCallback(() => {
    const maybePromise = reloadIdleAccounts?.();
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => {});
    }
  }, [reloadIdleAccounts]);

  return (
    <Stack gap={3}>
      {displayError && (
        <Alert variant="danger" className="mb-0">
          {displayError.message}
        </Alert>
      )}

      <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2">
        <Form className="mb-0 flex-grow-1" onSubmit={(event) => event.preventDefault()}>
          <Form.Control
            type="search"
            placeholder="Поиск по ID, имени, фамилии, e-mail, телефону или никнейму"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </Form>
        <Button
          type="button"
          variant="outline-secondary"
          className="flex-shrink-0"
          onClick={openIdleAccountsModal}
        >
          Аккаунты без заявок
        </Button>
      </div>

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
        onReset={handleOpenReset}
        expanded={expandedSection === 'verified'}
        onToggle={() => toggleSection('verified')}
      />

      <VerificationRequestModal
        show={modalState.show && Boolean(activeRequest)}
        request={activeRequest}
        onClose={closeRequestModal}
        onConfirm={handleModalConfirm}
        onReject={handleModalReject}
        onReset={handleModalReset}
        busy={modalBusy}
        defaultMode={modalState.defaultMode}
        focusModule={modalState.moduleKey}
        focusStatus={modalState.moduleStatus}
      />

      <VerificationIdleAccountsModal
        show={idleModalShown}
        onClose={closeIdleAccountsModal}
        accounts={idleAccounts}
        loading={idleAccountsLoading}
        error={idleAccountsError}
        onReload={handleReloadIdleAccounts}
      />
    </Stack>
  );
}

