import { loadExtras, saveExtras, pickExtras } from './profileExtras';
import { notifyAdminTransactionsChanged } from '../admin/transactions';

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
    persistExtras(uid, (current) => {
      if (!input) return current;

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
      if (!file) return current;

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
        ...current,
        verificationUploads: [entry, ...(current.verificationUploads || [])],
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

  const submitVerificationRequest = (statusMap = {}) => {
    let createdRequest = null;

    const nextExtras = persistExtras(uid, (current) => {
      const requestedCandidates = normalizeRequestedCandidates(statusMap);

      const requestedKeys = Object.keys(requestedCandidates).filter((key) =>
        ['email', 'phone', 'address', 'doc'].includes(key),
      );

      if (requestedKeys.length === 0) {
        return current;
      }

      const normalizedRequested = requestedKeys.reduce((acc, key) => {
        acc[key] = Boolean(requestedCandidates[key]);
        return acc;
      }, {});

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

      const requests = Array.isArray(current.verificationRequests)
        ? current.verificationRequests.slice()
        : [];

      const openIndex = requests.findIndex(
        (request) => request && request.status !== 'approved' && request.status !== 'rejected',
      );

      const normalizeFields = (fields = {}) => ({
        email: Boolean(fields.email),
        phone: Boolean(fields.phone),
        address: Boolean(fields.address),
        doc: Boolean(fields.doc),
      });

      if (openIndex >= 0) {
        const existing = requests[openIndex] || {};
        const previousCompleted = normalizeFields(existing.completedFields);
        const previousRequested = normalizeFields(existing.requestedFields ?? existing.completedFields);
        const filteredRequested = normalizeFields({
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

        createdRequest = updatedRequest;
        const remaining = requests.filter((_, index) => index !== openIndex);
        return {
          ...current,
          verificationRequests: [updatedRequest, ...remaining],
        };
      }

      const completedFields = normalizeFields();
      const filteredRequested = normalizeFields(normalizedRequested);
      const completedCount = 0;
      const nextRequest = {
        ...baseRequest,
        completedFields,
        requestedFields: filteredRequested,
        completedCount,
        totalFields,
        history: [],
      };

      createdRequest = nextRequest;
      return {
        ...current,
        verificationRequests: [nextRequest, ...requests],
      };
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
    setEmailVerified,
  };
};
