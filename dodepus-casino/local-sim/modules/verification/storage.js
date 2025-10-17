import { loadExtras, saveExtras, pickExtras } from '../auth/index.js';

const cloneArray = (value) => (Array.isArray(value) ? value.slice() : []);

export const readVerificationSnapshot = (userId) => {
  if (!userId) {
    throw new Error('userId is required to read verification snapshot');
  }

  const extras = loadExtras(userId);
  return {
    extras,
    requests: cloneArray(extras.verificationRequests),
    uploads: cloneArray(extras.verificationUploads),
  };
};

export const writeVerificationSnapshot = (userId, snapshot, baseSnapshot = null) => {
  if (!userId) {
    throw new Error('userId is required to write verification snapshot');
  }

  const reference = baseSnapshot ?? readVerificationSnapshot(userId);
  const nextRequests = cloneArray(snapshot?.requests ?? reference.requests);
  const nextUploads = cloneArray(snapshot?.uploads ?? reference.uploads);

  const mergedExtras = {
    ...reference.extras,
    ...(snapshot?.extras ?? {}),
    verificationRequests: nextRequests,
    verificationUploads: nextUploads,
  };

  const normalized = pickExtras(mergedExtras);
  saveExtras(userId, normalized);
  return normalized;
};

export const updateVerificationSnapshot = (userId, updater) => {
  if (typeof updater !== 'function') {
    throw new Error('updater must be a function');
  }

  const base = readVerificationSnapshot(userId);
  const draft = {
    extras: { ...base.extras },
    requests: cloneArray(base.requests),
    uploads: cloneArray(base.uploads),
  };

  const result = updater(draft) || draft;
  return writeVerificationSnapshot(userId, result, base);
};
