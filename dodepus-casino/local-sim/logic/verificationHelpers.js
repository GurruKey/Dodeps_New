const VALID_STATUSES = Object.freeze(['idle', 'pending', 'rejected', 'approved']);

export const normalizeString = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

export const normalizeStatus = (value) => {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) return 'pending';
  if (normalized === 'approved' || normalized === 'verified' || normalized === 'done') {
    return 'approved';
  }
  if (normalized === 'rejected' || normalized === 'declined' || normalized === 'denied') {
    return 'rejected';
  }
  if (['in_review', 'inreview', 'pending', 'processing'].includes(normalized)) {
    return 'pending';
  }
  if (['waiting', 'idle', 'new', 'requested'].includes(normalized)) {
    return 'idle';
  }
  if (normalized === 'partial') {
    return 'pending';
  }
  if (normalized === 'reset') {
    return 'idle';
  }
  if (VALID_STATUSES.includes(normalized)) {
    return normalized;
  }
  return 'pending';
};

export const normalizeBooleanMap = (fields = {}) => {
  const result = {};
  if (!fields || typeof fields !== 'object') {
    return { email: false, phone: false, address: false, doc: false };
  }
  ['email', 'phone', 'address', 'doc'].forEach((key) => {
    result[key] = Boolean(fields[key]);
  });
  return result;
};

export const mergeFieldStates = (current = {}, patch = {}) => {
  const normalizedCurrent = normalizeBooleanMap(current);
  const normalizedPatch = normalizeBooleanMap(patch);
  const keys = new Set([
    ...Object.keys(normalizedCurrent),
    ...Object.keys(normalizedPatch),
  ]);

  const result = {};
  keys.forEach((key) => {
    if (!key) return;
    result[key] = normalizedPatch[key] ?? normalizedCurrent[key] ?? false;
  });

  return normalizeBooleanMap(result);
};

export const normalizeNotes = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '';
};

export const normalizeFieldsPatch = (fields = {}) => {
  if (!fields || typeof fields !== 'object') {
    return {};
  }

  const patch = {};

  if ('email' in fields) {
    patch.email = Boolean(fields.email);
  }

  if ('phone' in fields) {
    patch.phone = Boolean(fields.phone);
  }

  if ('address' in fields) {
    patch.address = Boolean(fields.address);
  }

  if ('doc' in fields) {
    patch.doc = Boolean(fields.doc);
  }

  if ('document' in fields) {
    patch.doc = Boolean(fields.document);
  }

  return patch;
};
