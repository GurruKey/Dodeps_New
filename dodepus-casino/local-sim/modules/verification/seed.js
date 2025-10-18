import { normalizeBooleanMap } from './helpers.js';

const clone = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const normalizeRequest = (request) => {
  if (!request || typeof request !== 'object') {
    return null;
  }

  const normalized = { ...clone(request) };
  normalized.completedFields = normalizeBooleanMap(request.completedFields);
  normalized.requestedFields = normalizeBooleanMap(request.requestedFields);
  normalized.clearedFields = normalizeBooleanMap(request.clearedFields);
  return normalized;
};

const normalizeUpload = (upload) => {
  if (!upload || typeof upload !== 'object') {
    return null;
  }
  return clone(upload);
};

export const getVerificationSeedForUser = () => ({
  verificationRequests: [],
  verificationUploads: [],
});

export const applyVerificationSeed = (extras = {}) => {
  const normalizedExtras = { ...extras };

  const requests = Array.isArray(extras.verificationRequests)
    ? extras.verificationRequests.map(normalizeRequest).filter(Boolean)
    : [];

  const uploads = Array.isArray(extras.verificationUploads)
    ? extras.verificationUploads.map(normalizeUpload).filter(Boolean)
    : [];

  normalizedExtras.verificationRequests = requests;
  normalizedExtras.verificationUploads = uploads;

  return normalizedExtras;
};
