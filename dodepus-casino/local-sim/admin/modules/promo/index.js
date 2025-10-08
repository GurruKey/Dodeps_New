import {
  ADMIN_PROMOCODES_EVENT,
  ADMIN_PROMOCODE_STATUS_LABELS,
  DEFAULT_PROMOCODE_CASHOUT_CAP,
  DEFAULT_PROMOCODE_WAGER,
} from './constants.js';
import { promoTypeDefinitions, getPromoTypeById } from './definitions/index.js';
import { storageAdapter } from './storage.js';

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

const toIsoDateTimeOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const normalizeSchedule = (schedule) => {
  if (!schedule || typeof schedule !== 'object') {
    return { startsAt: null, endsAt: null };
  }

  const startsAt =
    toIsoDateTimeOrNull(schedule.startsAt ?? schedule.start ?? schedule.from) ?? null;
  const endsAt = toIsoDateTimeOrNull(schedule.endsAt ?? schedule.end ?? schedule.until) ?? null;

  return { startsAt, endsAt };
};

const normalizeActivations = (activations, code) => {
  if (!Array.isArray(activations)) return [];

  return activations
    .map((item, index) => {
      const activatedAt = toIsoDateTimeOrNull(item?.activatedAt ?? item?.createdAt ?? null);
      if (!activatedAt) return null;

      const clientId =
        typeof item?.clientId === 'string' && item.clientId.trim()
          ? item.clientId.trim()
          : typeof item?.playerId === 'string' && item.playerId.trim()
          ? item.playerId.trim()
          : null;

      const activationId =
        typeof item?.id === 'string' && item.id.trim()
          ? item.id.trim()
          : `${code ?? 'promo'}-activation-${index + 1}`;

      return {
        id: activationId,
        clientId,
        activatedAt,
      };
    })
    .filter(Boolean)
    .sort((a, b) => Date.parse(b.activatedAt) - Date.parse(a.activatedAt));
};

const createSeedActivations = (code, used, limit) => {
  const count = Math.max(0, Math.min(toNullablePositiveInt(used, 0), limit ?? Infinity));
  const now = Date.now();
  const maxOffset = 90 * 24 * 60 * 60 * 1000; // 90 days

  return Array.from({ length: count }).map((_, index) => {
    const offset = Math.floor(Math.random() * maxOffset);
    const activatedAt = new Date(now - offset).toISOString();
    const clientIndex = Math.floor(Math.random() * 9000) + 1000;
    return {
      id: `${code ?? 'promo'}-activation-${index + 1}`,
      clientId: `client-${clientIndex}`,
      activatedAt,
    };
  });
};

const normalizeRepeatParams = (repeat) => {
  if (!repeat || typeof repeat !== 'object') return null;

  const limit = toNullablePositiveInt(
    repeat.limit ?? repeat.max ?? repeat.times ?? repeat.repeatLimit ?? repeat.allowed,
    null,
  );

  const delayHoursRaw =
    repeat.delayHours ??
    repeat.delay ??
    repeat.cooldownHours ??
    (typeof repeat.cooldownDays === 'number' ? repeat.cooldownDays * 24 : null) ??
    null;

  let delayHours = toNullablePositiveInt(delayHoursRaw, null);

  if (delayHours == null && typeof repeat.delayMinutes === 'number') {
    delayHours = Math.max(0, Math.round((repeat.delayMinutes / 60) * 100) / 100);
  }

  if (delayHours == null && typeof repeat.delaySeconds === 'number') {
    delayHours = Math.max(0, Math.round((repeat.delaySeconds / 3600) * 100) / 100);
  }

  if (limit == null && delayHours == null) return null;

  const normalized = {};
  if (limit != null) {
    normalized.limit = limit;
  }
  if (delayHours != null) {
    normalized.delayHours = delayHours;
  }

  return normalized;
};

const seedRecords = () =>
  promoTypeDefinitions.map((type, index) => {
    const seed = type?.seed ?? {};
    const createdAt = seed.createdAt ?? new Date(Date.now() - (index + 1) * 86_400_000).toISOString();
    const updatedAt = seed.updatedAt ?? createdAt;
    const status = normalizeStatus(seed.status ?? 'active');

    const limit = coerceLimit(seed.limit);
    const code = normalizeCode(seed.code ?? type.shortName ?? `PROMO-${index + 1}`);
    const baseUsed = clampUsage(seed.used, limit);

    const seedSchedule = normalizeSchedule(seed.schedule ?? seed.params?.schedule ?? {});

    const params = seed.params ? { ...seed.params } : {};
    const repeatFromSeed = normalizeRepeatParams(seed.repeat ?? seed.params?.repeat ?? null);
    if (repeatFromSeed) {
      params.repeat = repeatFromSeed;
    } else if (params.repeat) {
      const normalizedRepeat = normalizeRepeatParams(params.repeat);
      if (normalizedRepeat) {
        params.repeat = normalizedRepeat;
      } else {
        delete params.repeat;
      }
    }

    const seedActivations = normalizeActivations(
      seed.activations ?? params.activations ?? [],
      code,
    );
    const generatedActivations =
      seedActivations.length > 0 ? seedActivations : createSeedActivations(code, baseUsed, limit);
    const activations = normalizeActivations(generatedActivations, code);
    const used = activations.length > 0 ? clampUsage(activations.length, limit) : baseUsed;

    if (params.activations) {
      delete params.activations;
    }

    return {
      id: code,
      typeId: type.id,
      code,
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
      params,
      startsAt: seed.startsAt ? toIsoDateTimeOrNull(seed.startsAt) : seedSchedule.startsAt,
      endsAt: seed.endsAt ? toIsoDateTimeOrNull(seed.endsAt) : seedSchedule.endsAt,
      createdAt,
      updatedAt,
      activations,
    };
  });

const ensureSeededRecords = () => {
  const records = storageAdapter.readFromStorage();

  if (!memory.isSeeded) {
    memory.isSeeded = true;
  }

  return records;
};

const composePromocode = (record) => {
  if (!record) return null;
  const type = getPromoTypeById(record.typeId);
  const status = normalizeStatus(record.status);
  const limit = coerceLimit(record.limit);
  const activations = normalizeActivations(record.activations ?? record.params?.activations ?? [], record.code);
  const used = Math.max(activations.length, clampUsage(record.used, limit));

  const wager = toNullableNumber(
    record.wager,
    type?.seed?.wager ?? DEFAULT_PROMOCODE_WAGER,
  );
  const cashoutCap = toNullableNumber(
    record.cashoutCap,
    type?.seed?.cashoutCap ?? DEFAULT_PROMOCODE_CASHOUT_CAP,
  );

  const schedule = normalizeSchedule(record.schedule ?? record.params?.schedule ?? {});

  const repeatParams = normalizeRepeatParams(record.params?.repeat ?? record.repeat ?? null);
  const params = record.params ? { ...record.params } : {};
  if (params.repeat) {
    if (repeatParams) {
      params.repeat = repeatParams;
    } else {
      delete params.repeat;
    }
  } else if (repeatParams) {
    params.repeat = repeatParams;
  }
  if (params.activations) {
    delete params.activations;
  }

  return {
    id: record.code ?? record.id,
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
    params,
    startsAt: record.startsAt ?? schedule.startsAt ?? null,
    endsAt: record.endsAt ?? schedule.endsAt ?? null,
    repeatLimit: repeatParams?.limit ?? null,
    repeatDelayHours: repeatParams?.delayHours ?? null,
    activations,
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

const ARCHIVED_PROMOCODE_STATUSES = new Set(['expired', 'paused', 'archived']);

export const listAdminArchivedPromocodes = async ({ signal, delay = 200 } = {}) => {
  const data = await listAdminPromocodes({ signal, delay });
  return data.filter((promocode) => ARCHIVED_PROMOCODE_STATUSES.has(promocode.status));
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
  const params = input?.params && typeof input.params === 'object' ? { ...input.params } : {};
  const repeatParams = normalizeRepeatParams(input?.repeat ?? input?.params?.repeat ?? null);
  if (repeatParams) {
    params.repeat = repeatParams;
  } else if (params.repeat) {
    const normalizedRepeat = normalizeRepeatParams(params.repeat);
    if (normalizedRepeat) {
      params.repeat = normalizedRepeat;
    } else {
      delete params.repeat;
    }
  }

  const scheduleFromInput = normalizeSchedule(input?.schedule ?? params.schedule ?? {});
  const startsAt = toIsoDateTimeOrNull(input?.startsAt) ?? scheduleFromInput.startsAt ?? null;
  const endsAt = toIsoDateTimeOrNull(input?.endsAt) ?? scheduleFromInput.endsAt ?? null;

  if (startsAt || endsAt) {
    params.schedule = { startsAt, endsAt };
  }

  const now = nowIso();

  const record = {
    id: code,
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
    startsAt,
    endsAt,
    createdAt: now,
    updatedAt: now,
    activations: [],
  };

  const next = [...existing, record];
  storageAdapter.writeToStorage(next);
  const composed = composePromocode(record);
  emitPromocodesChanged({ action: 'create', promocode: composed });
  return composed;
};

const updatePromocodeRecord = (idOrCode, mutator) => {
  const records = ensureSeededRecords();
  const index = records.findIndex((record) => record.code === idOrCode || record.id === idOrCode);
  if (index === -1) {
    throw new Error('Промокод не найден');
  }

  const current = records[index];
  const draft = { ...current };
  const result = typeof mutator === 'function' ? mutator(draft) : draft;
  const nextRecord = result && typeof result === 'object' ? result : draft;

  records[index] = nextRecord;
  storageAdapter.writeToStorage(records);
  const composed = composePromocode(nextRecord);
  emitPromocodesChanged({ action: 'update', promocode: composed });
  return composed;
};

export const getAdminPromocodeById = (idOrCode) => {
  const records = ensureSeededRecords();
  const record = records.find((item) => item.code === idOrCode || item.id === idOrCode);
  if (!record) return null;
  return composePromocode(record);
};

export const pauseAdminPromocode = (idOrCode) =>
  updatePromocodeRecord(idOrCode, (draft) => {
    draft.status = 'paused';
    draft.updatedAt = nowIso();
    return draft;
  });

export const resumeAdminPromocode = (idOrCode) =>
  updatePromocodeRecord(idOrCode, (draft) => {
    draft.status = 'active';
    draft.updatedAt = nowIso();
    return draft;
  });

export const archiveAdminPromocode = (idOrCode) =>
  updatePromocodeRecord(idOrCode, (draft) => {
    draft.status = 'archived';
    draft.updatedAt = nowIso();
    return draft;
  });

export const extendAdminPromocodeEndsAt = (idOrCode, { hours = 24 } = {}) =>
  updatePromocodeRecord(idOrCode, (draft) => {
    const now = new Date();
    const base = draft.endsAt ? new Date(draft.endsAt) : now;
    if (Number.isNaN(base.getTime())) {
      base.setTime(now.getTime());
    }
    base.setTime(base.getTime() + Math.max(1, Number(hours) || 0) * 60 * 60 * 1000);
    const nextEndsAt = base.toISOString();
    draft.endsAt = nextEndsAt;
    draft.params = draft.params && typeof draft.params === 'object' ? { ...draft.params } : {};
    if (draft.params.schedule && typeof draft.params.schedule === 'object') {
      draft.params.schedule = { ...draft.params.schedule, endsAt: nextEndsAt };
    }
    draft.updatedAt = nowIso();
    return draft;
  });

export const __internals = Object.freeze({
  normalizeCode,
  normalizeStatus,
  composePromocode,
  seedRecords,
  ensureSeededRecords,
  sortPromocodes,
});
