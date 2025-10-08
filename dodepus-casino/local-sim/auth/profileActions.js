import { loadExtras, saveExtras, pickExtras } from './profileExtras';
import { notifyAdminTransactionsChanged } from '../admin/features/transactions/index.js';
import { updateVerificationSnapshot } from '../tables/verification.js';
import { normalizeNotes, normalizeBooleanMap } from '../logic/verificationHelpers.js';

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
    const nextExtras = updateVerificationSnapshot(uid, ({ requests, extras }) => {
      const requestedCandidates = normalizeRequestedCandidates(statusMap);
      const normalizedRequested = normalizeBooleanMap(requestedCandidates);
      const requestedKeys = Object.keys(normalizedRequested).filter((key) => normalizedRequested[key]);

      if (requestedKeys.length === 0) {
        return { extras, requests };
      }

      const totalFields = requestedKeys.length || 4;
      const nowIso = new Date().toISOString();

      const baseRequest = {
        id:
          statusMap.id ||
          getRandomUuid() ||
          `vrf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        userId: uid,
        status: 'pending',
        submittedAt: nowIso,
        updatedAt: nowIso,
      };

      const queue = Array.isArray(requests) ? requests.slice() : [];
      const openIndex = queue.findIndex(
        (request) => request && request.status !== 'approved' && request.status !== 'rejected',
      );

      if (openIndex >= 0) {
        const existing = queue[openIndex] || {};
        const previousCompleted = normalizeBooleanMap(existing.completedFields);
        const previousRequested = normalizeBooleanMap(existing.requestedFields ?? existing.completedFields);
        const filteredRequested = normalizeBooleanMap({
          email:
            (normalizedRequested.email || previousRequested.email) && !previousCompleted.email,
          phone:
            (normalizedRequested.phone || previousRequested.phone) && !previousCompleted.phone,
          address:
            (normalizedRequested.address || previousRequested.address) && !previousCompleted.address,
          doc: (normalizedRequested.doc || previousRequested.doc) && !previousCompleted.doc,
        });
        const completedCount = Object.values(previousCompleted).filter(Boolean).length;
        const updatedRequest = {
          ...existing,
          ...baseRequest,
          id: existing.id || baseRequest.id,
          completedFields: previousCompleted,
          requestedFields: filteredRequested,
          completedCount,
          totalFields: existing.totalFields || totalFields,
          reviewerId: '',
          reviewerName: '',
          reviewerRole: '',
          history: Array.isArray(existing.history) ? existing.history.slice() : [],
        };

        const remaining = queue.filter((_, index) => index !== openIndex);
        return { extras, requests: [updatedRequest, ...remaining] };
      }

      const completedFields = normalizeBooleanMap();
      const filteredRequested = normalizeBooleanMap(normalizedRequested);
      const nextRequest = {
        ...baseRequest,
        completedFields,
        requestedFields: filteredRequested,
        completedCount: 0,
        totalFields,
        history: [],
      };

      return { extras, requests: [nextRequest, ...queue] };
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

      if (history.length > 0) {
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
      const completedCount = Object.values(completedFieldsNormalized).filter(Boolean).length;

      const nextRequest = {
        ...target,
        status: stillRequested ? 'pending' : 'idle',
        requestedFields: nextRequested,
        updatedAt: nowIso,
        history: nextHistory,
        notes: normalizeNotes(input.notes) || target.notes || '',
        completedCount,
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
