import {
  ADMIN_PROMOCODES_EVENT,
  ADMIN_PROMOCODE_STATUS_LABELS,
  DEFAULT_PROMOCODE_CASHOUT_CAP,
  DEFAULT_PROMOCODE_WAGER,
} from './constants';
import { promoTypeDefinitions, getPromoTypeById } from './definitions';
import { storageAdapter } from './storage';

const ALLOWED_STATUSES = new Set(Object.keys(ADMIN_PROMOCODE_STATUS_LABELS));

const memory = {
  isSeeded: false,
};

const getEventTarget = () => {
  if (typeof window !== 'undefined') return window;
  if (typeof globalThis !== 'undefined' && globalThis?.addEventListener) {
    return globalThis;
  }
  return null;
};

const createAbortError = (reason) => {
  if (reason instanceof Error) return reason;
  if (typeof DOMException === 'function') {
    return new DOMException('Aborted', 'AbortError');
  }
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
};

const toNullablePositiveInt = (value, fallback = null) => {
  if (value == null || value === '') return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return fallback;
  return Math.floor(numeric);
};

const toNullableNumber = (value, fallback = null) => {
  if (value == null || value === '') return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return numeric;
};

const normalizeCode = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.replace(/\s+/g, '_').toUpperCase();
};

const normalizeStatus = (value) => {
  if (typeof value !== 'string') return 'draft';
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 'draft';
  if (ALLOWED_STATUSES.has(normalized)) {
    return normalized;
  }
  return 'draft';
};

const composeStatusLabel = (status) =>
  ADMIN_PROMOCODE_STATUS_LABELS[status] ?? ADMIN_PROMOCODE_STATUS_LABELS.draft;

const coerceLimit = (limit) => {
  const normalized = toNullablePositiveInt(limit, null);
  if (normalized == null) return null;
  return normalized;
};

const clampUsage = (used, limit) => {
  const normalizedUsed = toNullablePositiveInt(used, 0);
  const normalizedLimit = coerceLimit(limit);
  if (normalizedLimit == null) return normalizedUsed;
  return Math.min(normalizedUsed, normalizedLimit);
};

const nowIso = () => new Date().toISOString();

const seedRecords = () =>
  promoTypeDefinitions.map((type, index) => {
    const seed = type?.seed ?? {};
    const createdAt = seed.createdAt ?? new Date(Date.now() - (index + 1) * 86_400_000).toISOString();
    const updatedAt = seed.updatedAt ?? createdAt;
    const status = normalizeStatus(seed.status ?? 'active');

    const limit = coerceLimit(seed.limit);
    const used = clampUsage(seed.used, limit);

    return {
      id: seed.id ?? `seed-${type.id}-${index}`,
      typeId: type.id,
      code: normalizeCode(seed.code ?? type.shortName ?? `PROMO-${index + 1}`),
      title:
        typeof seed.title === 'string' && seed.title.trim()
          ? seed.title.trim()
          : typeof type.name === 'string'
          ? type.name
          : `Промокод ${index + 1}`,
      reward:
        typeof seed.reward === 'string' && seed.reward.trim()
          ? seed.reward.trim()
          : typeof type.description === 'string'
          ? type.description
          : '',
      limit,
      used,
      status,
      wager: toNullableNumber(seed.wager, DEFAULT_PROMOCODE_WAGER),
      cashoutCap: toNullableNumber(seed.cashoutCap, DEFAULT_PROMOCODE_CASHOUT_CAP),
      notes: typeof seed.notes === 'string' ? seed.notes.trim() : '',
      params: seed.params ?? {},
      createdAt,
      updatedAt,
    };
  });

const ensureSeededRecords = () => {
  if (!memory.isSeeded) {
    const existing = storageAdapter.readFromStorage();
    if (existing.length === 0) {
      const seeded = seedRecords();
      storageAdapter.writeToStorage(seeded);
      memory.isSeeded = true;
      return seeded;
    }
    memory.isSeeded = true;
    return existing;
  }
  return storageAdapter.readFromStorage();
};

const composePromocode = (record) => {
  if (!record) return null;
  const type = getPromoTypeById(record.typeId);
  const status = normalizeStatus(record.status);
  const limit = coerceLimit(record.limit);
  const used = clampUsage(record.used, limit);

  const wager = toNullableNumber(
    record.wager,
    type?.seed?.wager ?? DEFAULT_PROMOCODE_WAGER,
  );
  const cashoutCap = toNullableNumber(
    record.cashoutCap,
    type?.seed?.cashoutCap ?? DEFAULT_PROMOCODE_CASHOUT_CAP,
  );

  return {
    id: record.id,
    code: record.code,
    title: record.title,
    reward: record.reward,
    limit,
    used,
    status,
    statusLabel: composeStatusLabel(status),
    wager,
    cashoutCap,
    notes: record.notes ?? '',
    params: record.params ?? {},
    type: type
      ? {
          id: type.id,
          name: type.name,
          shortName: type.shortName ?? null,
          description: type.description ?? '',
          howItWorks: type.howItWorks ?? '',
          formula: type.formula ?? '',
          plainText: type.plainText ?? '',
        }
      : null,
    createdAt: record.createdAt ?? null,
    updatedAt: record.updatedAt ?? null,
  };
};

const sortPromocodes = (records) => {
  const copy = Array.isArray(records) ? [...records] : [];
  copy.sort((a, b) => {
    const timeA = a.updatedAt ? Date.parse(a.updatedAt) : a.createdAt ? Date.parse(a.createdAt) : 0;
    const timeB = b.updatedAt ? Date.parse(b.updatedAt) : b.createdAt ? Date.parse(b.createdAt) : 0;
    return timeB - timeA;
  });
  return copy;
};

const emitPromocodesChanged = (detail) => {
  const target = getEventTarget();
  if (!target?.dispatchEvent || typeof CustomEvent !== 'function') return;

  try {
    target.dispatchEvent(new CustomEvent(ADMIN_PROMOCODES_EVENT, { detail: detail ?? null }));
  } catch (error) {
    console.warn('Failed to emit admin promocodes change event', error);
  }
};

export const notifyAdminPromocodesChanged = (detail) => emitPromocodesChanged(detail);

export const subscribeToAdminPromocodes = (callback) => {
  const target = getEventTarget();
  if (!target?.addEventListener || typeof callback !== 'function') {
    return () => {};
  }

  const handler = (event) => {
    try {
      callback(event?.detail ?? null);
    } catch (error) {
      console.warn('Failed to handle admin promocodes subscription callback', error);
    }
  };

  target.addEventListener(ADMIN_PROMOCODES_EVENT, handler);
  return () => {
    target.removeEventListener(ADMIN_PROMOCODES_EVENT, handler);
  };
};

export const listAdminPromocodes = ({ signal, delay = 200 } = {}) => {
  if (signal?.aborted) {
    return Promise.reject(createAbortError(signal.reason));
  }

  ensureSeededRecords();

  return new Promise((resolve, reject) => {
    const timeout = Math.max(0, delay ?? 0);

    const complete = () => {
      try {
        const rawRecords = ensureSeededRecords();
        const prepared = sortPromocodes(rawRecords)
          .map(composePromocode)
          .filter(Boolean);
        resolve(prepared);
      } catch (error) {
        reject(error);
      }
    };

    if (!timeout) {
      complete();
      return;
    }

    const timer = setTimeout(complete, timeout);

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(createAbortError(signal.reason));
        },
        { once: true },
      );
    }
  });
};

export const createAdminPromocode = (input) => {
  const type = getPromoTypeById(input?.typeId ?? input?.type);
  if (!type) {
    throw new Error('Неизвестный тип промокода');
  }

  const code = normalizeCode(input?.code);
  if (!code) {
    throw new Error('Код промокода обязателен');
  }

  const existing = ensureSeededRecords();
  if (existing.some((record) => record.code === code)) {
    throw new Error('Промокод с таким кодом уже существует');
  }

  const title =
    typeof input?.title === 'string' && input.title.trim()
      ? input.title.trim()
      : type.name ?? code;
  const reward =
    typeof input?.reward === 'string' && input.reward.trim()
      ? input.reward.trim()
      : type.seed?.reward ?? '';

  const limit = coerceLimit(input?.limit);
  const status = normalizeStatus(input?.status ?? 'draft');
  const wager = toNullableNumber(input?.wager, DEFAULT_PROMOCODE_WAGER);
  const cashoutCap = toNullableNumber(input?.cashoutCap, DEFAULT_PROMOCODE_CASHOUT_CAP);
  const notes = typeof input?.notes === 'string' ? input.notes.trim() : '';
  const params = input?.params ?? {};
  const now = nowIso();

  const record = {
    id: `promo-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    typeId: type.id,
    code,
    title,
    reward,
    limit,
    used: 0,
    status,
    wager,
    cashoutCap,
    notes,
    params,
    createdAt: now,
    updatedAt: now,
  };

  const next = [...existing, record];
  storageAdapter.writeToStorage(next);
  const composed = composePromocode(record);
  emitPromocodesChanged({ action: 'create', promocode: composed });
  return composed;
};

export const __internals = Object.freeze({
  normalizeCode,
  normalizeStatus,
  composePromocode,
  seedRecords,
  ensureSeededRecords,
  sortPromocodes,
});
