import { loadExtras, saveExtras, pickExtras } from './profileExtras';
import { notifyAdminTransactionsChanged } from '../admin/features/transactions/index.js';
import { updateVerificationSnapshot } from '../tables/verification.js';
import {
  normalizeNotes,
  normalizeBooleanMap,
  normalizeStatus,
  normalizeString,
} from '../logic/verificationHelpers.js';

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const ensurePositive = (value) => Math.max(0, value);

const getRandomUuid = () => {
  if (typeof globalThis === 'object' && globalThis) {
    const { crypto } = globalThis;
    if (crypto && typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID();
      } catch {
        // ignore errors and fall back to manual generation below
      }
    }
  }

  return null;
};

const persistExtras = (uid, computeNext) => {
  const current = pickExtras(loadExtras(uid));
  const next = pickExtras(computeNext(current));
  saveExtras(uid, next);
  return next;
};

export const createProfileActions = (uid) => {
  if (!uid) {
    throw new Error('Требуется идентификатор пользователя для обновления профиля');
  }

  const patchExtras = (patch) =>
    persistExtras(uid, (current) => ({
      ...current,
      ...patch,
    }));

  const setBalance = (value) =>
    patchExtras({
      balance: ensurePositive(toNumber(value)),
    });

  const addBalance = (delta) =>
    persistExtras(uid, (current) => ({
      ...current,
      balance: ensurePositive(
        toNumber(current.balance || 0) + toNumber(delta || 0)
      ),
    }));

  const setCasinoBalance = (value) =>
    patchExtras({
      casinoBalance: ensurePositive(toNumber(value)),
    });

  const addCasinoBalance = (delta) =>
    persistExtras(uid, (current) => ({
      ...current,
      casinoBalance: ensurePositive(
        toNumber(current.casinoBalance || 0) + toNumber(delta || 0)
      ),
    }));

  const setNickname = (nickname) =>
    patchExtras({
      nickname: nickname == null ? '' : nickname,
    });

  const updateProfile = (patch = {}) => patchExtras({ ...patch });

  const addTransaction = (txn = {}) => {
    let addedTransaction = null;

    const nextExtras = persistExtras(uid, (current) => {
      const id =
        txn.id ||
        `tx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const nextTxn = {
        id,
        currency: txn.currency || current.currency || 'USD',
        date: txn.date || new Date().toISOString(),
        status: txn.status || 'success',
        type: txn.type || 'deposit',
        method: txn.method || 'other',
        amount: toNumber(txn.amount, 0),
      };

      addedTransaction = nextTxn;

      return {
        ...current,
        transactions: [nextTxn, ...(current.transactions || [])],
      };
    });

    if (addedTransaction) {
      try {
        notifyAdminTransactionsChanged({ userId: uid, transaction: addedTransaction });
      } catch (error) {
        console.warn('Failed to broadcast admin transactions change', error);
      }
    }

    return nextExtras;
  };

  const addVerificationUpload = (input) =>
    updateVerificationSnapshot(uid, ({ uploads, extras }) => {
      if (!input) {
        return { extras, uploads };
      }

      const payload = (() => {
        if (input && typeof input === 'object' && 'file' in input) {
          return {
            file: input.file,
            category: input.verificationKind || input.category || input.kind,
            documentType: input.verificationType || input.documentType,
            documentLabel: input.verificationLabel || input.documentLabel,
          };
        }

        return { file: input };
      })();

      const file = payload.file;
      if (!file) {
        return { extras, uploads };
      }

      const normalizedCategory = (() => {
        const category = typeof payload.category === 'string' ? payload.category.toLowerCase() : '';
        if (category === 'address') return 'address';
        if (category === 'identity' || category === 'document' || category === 'doc') {
          return 'identity';
        }
        return 'identity';
      })();

      const previewUrl = (() => {
        if (typeof file.previewUrl === 'string' && file.previewUrl.trim()) {
          return file.previewUrl;
        }

        if (typeof file.dataUrl === 'string' && file.dataUrl.trim()) {
          return file.dataUrl;
        }

        if (typeof file.url === 'string' && file.url.trim()) {
          return file.url;
        }

        if (typeof file.preview === 'string' && file.preview.trim()) {
          return file.preview;
        }

        if (typeof file.path === 'string' && file.path.trim()) {
          return file.path;
        }

        return '';
      })();

      const entry = {
        id:
          file.id ||
          getRandomUuid() ||
          `vf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        name: file.name == null ? 'document' : file.name,
        type: file.type == null ? '' : file.type,
        size: toNumber(file.size, 0),
        uploadedAt: file.uploadedAt || new Date().toISOString(),
        verificationCategory: normalizedCategory,
        documentType:
          typeof payload.documentType === 'string' ? payload.documentType : '',
        documentLabel:
          typeof payload.documentLabel === 'string' ? payload.documentLabel : '',
        previewUrl,
      };

      return {
        extras,
        uploads: [entry, ...uploads],
      };
    });

  const normalizeRequestedCandidates = (input = {}) => {
    if (typeof input === 'string') {
      const key = input.trim().toLowerCase();
      if (!key) {
        return {};
      }
      return { [key]: true };
    }

    if (Array.isArray(input)) {
      return input.reduce((acc, value) => {
        if (typeof value !== 'string') {
          return acc;
        }

        const key = value.trim().toLowerCase();
        if (key) {
          acc[key] = true;
        }

        return acc;
      }, {});
    }

    if (input && typeof input === 'object') {
      if (input.fields && typeof input.fields === 'object') {
        return normalizeRequestedCandidates(input.fields);
      }

      if (typeof input.field === 'string') {
        return normalizeRequestedCandidates(input.field);
      }

      return {
        email: Boolean(input.email),
        phone: Boolean(input.phone),
        address: Boolean(input.address),
        doc: Boolean(input.doc || input.document),
      };
    }

    return {};
  };

  const normalizeCancellationCandidates = (input = {}) => {
    if (typeof input === 'string') {
      const key = input.trim().toLowerCase();
      if (!key) {
        return {};
      }
      return { [key]: true };
    }

    if (Array.isArray(input)) {
      return input.reduce((acc, value) => {
        if (typeof value === 'string') {
          const key = value.trim().toLowerCase();
          if (key) {
            acc[key] = true;
          }
        }
        return acc;
      }, {});
    }

    if (input && typeof input === 'object') {
      if (input.modules && typeof input.modules === 'object') {
        return normalizeCancellationCandidates(input.modules);
      }
      if (input.fields && typeof input.fields === 'object') {
        return normalizeCancellationCandidates(input.fields);
      }
      if (typeof input.field === 'string') {
        return normalizeCancellationCandidates(input.field);
      }

      return {
        email: Boolean(input.email),
        phone: Boolean(input.phone),
        address: Boolean(input.address),
        doc: Boolean(input.doc || input.document),
      };
    }

    return {};
  };

  const submitVerificationRequest = (statusMap = {}) => {
    const clientNote = normalizeNotes(statusMap.notes);
    const nextExtras = updateVerificationSnapshot(uid, ({ requests, extras }) => {
      const requestedCandidates = normalizeRequestedCandidates(statusMap);
      const normalizedRequested = normalizeBooleanMap(requestedCandidates);
      const requestedKeys = Object.keys(normalizedRequested).filter((key) => normalizedRequested[key]);

      if (requestedKeys.length === 0) {
        return { extras, requests };
      }

      const nowIso = new Date().toISOString();
      const sourceQueue = Array.isArray(requests) ? requests.slice() : [];

      const buildModuleHistory = (history, requestId, moduleKey) => {
        if (!Array.isArray(history)) {
          return [];
        }

        return history
          .map((entry) => {
            if (!entry || typeof entry !== 'object') {
              return null;
            }

            const entryRequested = normalizeBooleanMap(
              entry.requestedFields ?? entry.completedFields,
            );
            const entryCompleted = normalizeBooleanMap(entry.completedFields);
            const entryCleared = normalizeBooleanMap(entry.clearedFields);

            if (
              !entryRequested[moduleKey] &&
              !entryCompleted[moduleKey] &&
              !entryCleared[moduleKey]
            ) {
              return null;
            }

            return {
              ...entry,
              requestId,
              requestedFields: normalizeBooleanMap({ [moduleKey]: entryRequested[moduleKey] }),
              completedFields: normalizeBooleanMap({ [moduleKey]: entryCompleted[moduleKey] }),
              clearedFields: normalizeBooleanMap({ [moduleKey]: entryCleared[moduleKey] }),
            };
          })
          .filter(Boolean);
      };

      const deriveRequestId = (request, moduleKey, index) => {
        const baseId = normalizeString(request?.id) || normalizeString(request?.requestId);
        if (baseId) {
          return index === 0 ? baseId : `${baseId}:${moduleKey}`;
        }

        const timestamp =
          Date.parse(request?.submittedAt || request?.updatedAt || '') || Date.now();
        const seed = `${request?.userId || uid}_${timestamp.toString(36)}`;
        return index === 0 ? seed : `${seed}:${moduleKey}`;
      };

      const splitRequestsByModule = (queue) => {
        const normalizedQueue = [];

        queue.forEach((request) => {
          if (!request || typeof request !== 'object') {
            return;
          }

          const requestedFields = normalizeBooleanMap(
            request.requestedFields ?? request.completedFields,
          );
          const completedFields = normalizeBooleanMap(request.completedFields);
          const clearedFields = normalizeBooleanMap(request.clearedFields);

          const involvedModules = ['email', 'phone', 'address', 'doc'].filter(
            (key) => requestedFields[key] || completedFields[key] || clearedFields[key],
          );

          if (involvedModules.length === 0) {
            normalizedQueue.push({
              ...request,
              requestedFields: normalizeBooleanMap(),
              completedFields: normalizeBooleanMap(),
              clearedFields: normalizeBooleanMap(),
              moduleKey: '',
              history: [],
            });
            return;
          }

          involvedModules.forEach((moduleKey, index) => {
            const requestId = deriveRequestId(request, moduleKey, index);
            const moduleRequested = normalizeBooleanMap({
              [moduleKey]: requestedFields[moduleKey],
            });
            const moduleCompleted = normalizeBooleanMap({
              [moduleKey]: completedFields[moduleKey],
            });
            const moduleCleared = normalizeBooleanMap({
              [moduleKey]: clearedFields[moduleKey],
            });

            normalizedQueue.push({
              ...request,
              id: requestId,
              requestedFields: moduleRequested,
              completedFields: moduleCompleted,
              clearedFields: moduleCleared,
              moduleKey,
              history: buildModuleHistory(request.history, requestId, moduleKey),
            });
          });
        });

        return normalizedQueue;
      };

      const queue = splitRequestsByModule(sourceQueue);

      const findPendingIndex = (moduleKey) =>
        queue.findIndex((request) => {
          if (!request) {
            return false;
          }

          const status = normalizeStatus(request.status);
          if (status !== 'pending') {
            return false;
          }

          if (request.moduleKey === moduleKey) {
            return true;
          }

          const requested = normalizeBooleanMap(request.requestedFields ?? request.completedFields);
          return Boolean(requested[moduleKey]);
        });

      requestedKeys.forEach((moduleKey) => {
        const requestedFields = normalizeBooleanMap({ [moduleKey]: true });
        const emptyMap = normalizeBooleanMap();
        const pendingIndex = findPendingIndex(moduleKey);

        if (pendingIndex >= 0) {
          const existing = queue[pendingIndex] || {};
          const previousCompleted = normalizeBooleanMap(existing.completedFields);
          const previousCleared = normalizeBooleanMap(existing.clearedFields);
          const history = Array.isArray(existing.history) ? existing.history.slice() : [];
          const historyEntry = {
            id: `vrh_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
            requestId: existing.id || '',
            status: 'pending',
            actor: 'client',
            notes: clientNote,
            updatedAt: nowIso,
            requestedFields,
            completedFields: normalizeBooleanMap({
              [moduleKey]: previousCompleted[moduleKey],
            }),
            clearedFields: emptyMap,
          };

          const nextRequest = {
            ...existing,
            status: 'pending',
            submittedAt: existing.submittedAt || nowIso,
            updatedAt: nowIso,
            requestedFields,
            completedFields: normalizeBooleanMap({
              [moduleKey]: previousCompleted[moduleKey],
            }),
            clearedFields: normalizeBooleanMap({
              [moduleKey]: previousCleared[moduleKey],
            }),
            reviewerId: '',
            reviewerName: '',
            reviewerRole: '',
            notes: clientNote || existing.notes || '',
            moduleKey,
            history: [historyEntry, ...history],
          };

          queue.splice(pendingIndex, 1);
          queue.unshift(nextRequest);
          return;
        }

        const requestId =
          (statusMap.id ? `${statusMap.id}-${moduleKey}` : null) ||
          getRandomUuid() ||
          `vrf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

        const completedFields = normalizeBooleanMap();
        const historyEntry = {
          id: `vrh_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
          requestId,
          status: 'pending',
          actor: 'client',
          notes: clientNote,
          updatedAt: nowIso,
          requestedFields,
          completedFields,
          clearedFields: emptyMap,
        };

        const nextRequest = {
          id: requestId,
          userId: uid,
          status: 'pending',
          submittedAt: nowIso,
          updatedAt: nowIso,
          requestedFields,
          completedFields,
          clearedFields: emptyMap,
          reviewerId: '',
          reviewerName: '',
          reviewerRole: '',
          notes: clientNote || '',
          moduleKey,
          history: [historyEntry],
        };

        queue.unshift(nextRequest);
      });

      return { extras, requests: queue };
    });

    return nextExtras;
  };

  const cancelVerificationRequest = (input = {}) => {
    const nextExtras = updateVerificationSnapshot(uid, ({ requests, extras }) => {
      const queue = Array.isArray(requests) ? requests.slice() : [];
      const index = queue.findIndex((request) => request && request.status === 'pending');

      if (index === -1) {
        throw new Error('Нет активного запроса для отмены.');
      }

      const target = queue[index];
      const history = Array.isArray(target.history) ? target.history.slice() : [];

      const hasAdminActivity = history.some((entry) => {
        if (!entry || typeof entry !== 'object') {
          return false;
        }

        if (entry.actor && entry.actor !== 'client') {
          return true;
        }

        const reviewer = entry.reviewer;
        if (reviewer && (reviewer.id || reviewer.name || reviewer.role)) {
          return true;
        }

        const status = normalizeStatus(entry.status || target.status);
        return status === 'approved' || status === 'rejected' || status === 'partial' || status === 'reset';
      });

      if (hasAdminActivity) {
        throw new Error('Запрос уже обрабатывается администратором.');
      }

      const requested = normalizeRequestedCandidates(target.requestedFields);
      const completed = normalizeRequestedCandidates(target.completedFields);
      const selection = normalizeCancellationCandidates(input);

      const cancelSelection = { email: false, phone: false, address: false, doc: false };
      const selectionKeys = Object.keys(selection);
      let hasCancelled = false;

      Object.keys(cancelSelection).forEach((key) => {
        const shouldCancel = selection[key] ?? selectionKeys.length === 0;
        if (shouldCancel && requested[key] && !completed[key]) {
          cancelSelection[key] = true;
          hasCancelled = true;
        }
      });

      if (!hasCancelled) {
        throw new Error('Нет модулей для отмены.');
      }

      const nextRequested = { ...requested };
      Object.keys(cancelSelection).forEach((key) => {
        if (cancelSelection[key]) {
          nextRequested[key] = false;
        }
      });

      const stillRequested = Object.values(nextRequested).some(Boolean);
      const nowIso = new Date().toISOString();
      const clearedMap = {
        email: Boolean(cancelSelection.email),
        phone: Boolean(cancelSelection.phone),
        address: Boolean(cancelSelection.address),
        doc: Boolean(cancelSelection.doc),
      };

      const completedFieldsNormalized = normalizeRequestedCandidates(target.completedFields);
      Object.keys(cancelSelection).forEach((key) => {
        if (cancelSelection[key]) {
          completedFieldsNormalized[key] = false;
        }
      });

      const nextHistoryEntry = {
        id: `vrh_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        requestId: target.id,
        status: 'cancelled',
        actor: 'client',
        notes: normalizeNotes(input.notes),
        updatedAt: nowIso,
        requestedFields: nextRequested,
        completedFields: completedFieldsNormalized,
        clearedFields: clearedMap,
      };

      const nextHistory = [nextHistoryEntry, ...history];

      const nextStatus = stillRequested ? 'pending' : 'cancelled';

      const nextRequest = {
        ...target,
        status: nextStatus,
        requestedFields: nextRequested,
        updatedAt: nowIso,
        history: nextHistory,
        notes: normalizeNotes(input.notes) || target.notes || '',
        clearedFields: {
          email: Boolean(target?.clearedFields?.email) || clearedMap.email,
          phone: Boolean(target?.clearedFields?.phone) || clearedMap.phone,
          address: Boolean(target?.clearedFields?.address) || clearedMap.address,
          doc: Boolean(target?.clearedFields?.doc) || clearedMap.doc,
        },
      };

      queue[index] = nextRequest;

      return { extras, requests: queue };
    });

    return nextExtras;
  };

  const setEmailVerified = (flag = true) =>
    patchExtras({
      emailVerified: Boolean(flag),
    });

  return {
    load: () => loadExtras(uid),
    patchExtras,
    setBalance,
    addBalance,
    setCasinoBalance,
    addCasinoBalance,
    setNickname,
    updateProfile,
    addTransaction,
    addVerificationUpload,
    submitVerificationRequest,
    cancelVerificationRequest,
    setEmailVerified,
  };
};
