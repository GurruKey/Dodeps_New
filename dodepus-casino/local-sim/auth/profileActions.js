import { loadExtras, saveExtras, pickExtras } from './profileExtras';
import { notifyAdminTransactionsChanged } from '../admin/transactions';
import { notifyAdminVerificationRequestsChanged } from '../admin/verification';

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

  const addVerificationUpload = (file) =>
    persistExtras(uid, (current) => {
      if (!file) return current;

      const entry = {
        id:
          file.id ||
          getRandomUuid() ||
          `vf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        name: file.name == null ? 'document' : file.name,
        type: file.type == null ? '' : file.type,
        size: toNumber(file.size, 0),
        uploadedAt: file.uploadedAt || new Date().toISOString(),
      };

      return {
        ...current,
        verificationUploads: [entry, ...(current.verificationUploads || [])],
      };
    });

  const submitVerificationRequest = (statusMap = {}) => {
    let createdRequest = null;

    const nextExtras = persistExtras(uid, (current) => {
      const fields = {
        email: Boolean(statusMap.email),
        phone: Boolean(statusMap.phone),
        address: Boolean(statusMap.address),
        doc: Boolean(statusMap.doc),
      };

      const totalFields = Object.keys(fields).length || 4;
      const completedCount = Object.values(fields).filter(Boolean).length;
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
        completedFields: fields,
        completedCount,
        totalFields,
      };

      const requests = Array.isArray(current.verificationRequests)
        ? current.verificationRequests.slice()
        : [];

      const openIndex = requests.findIndex(
        (request) => request && request.status !== 'approved' && request.status !== 'rejected',
      );

      if (openIndex >= 0) {
        const existing = requests[openIndex];
        const updatedRequest = {
          ...existing,
          ...baseRequest,
          id: existing.id || baseRequest.id,
          submittedAt: nowIso,
        };

        createdRequest = updatedRequest;
        const remaining = requests.filter((_, index) => index !== openIndex);
        return {
          ...current,
          verificationRequests: [updatedRequest, ...remaining],
        };
      }

      createdRequest = baseRequest;
      return {
        ...current,
        verificationRequests: [baseRequest, ...requests],
      };
    });

    if (createdRequest) {
      try {
        notifyAdminVerificationRequestsChanged({
          type: 'created',
          userId: uid,
          requestId: createdRequest.id,
          status: createdRequest.status,
        });
      } catch (error) {
        console.warn('Failed to broadcast admin verification request change', error);
      }
    }

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
