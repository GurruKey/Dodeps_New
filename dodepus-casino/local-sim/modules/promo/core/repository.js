import {
  DEFAULT_PROMOCODE_CASHOUT_CAP,
  DEFAULT_PROMOCODE_WAGER,
} from '../constants.js';
import { listCanonicalPromocodeRecords, clonePromocodeRecord } from '../dataset.js';
import { promoTypeDefinitions, getPromoTypeById } from '../definitions/index.js';
import { storageAdapter } from '../storage.js';
import { emitPromocodesChanged } from './events.js';
import {
  clampUsage,
  coerceLimit,
  composeStatusLabel,
  createSeedActivations,
  normalizeActivations,
  normalizeAudienceParams,
  normalizeDisplayParams,
  normalizeLimitsParams,
  normalizeRepeatParams,
  normalizeSchedule,
  normalizeStatus,
  normalizeCode,
  sortPromocodes,
  toIsoDateTimeOrNull,
  toNullableNumber,
} from './helpers.js';

const memory = {
  isSeeded: false,
  records: [],
};

const captureRecordsInMemory = (records) => {
  memory.records = Array.isArray(records)
    ? records.map((record) => clonePromocodeRecord(record)).filter(Boolean)
    : [];
  memory.isSeeded = true;
};

const cloneFromMemory = () =>
  Array.isArray(memory.records)
    ? memory.records.map((record) => clonePromocodeRecord(record)).filter(Boolean)
    : [];

const generateRecordsFromDefinitions = () =>
  promoTypeDefinitions.map((type, index) => {
    const seed = type?.seed ?? {};
    const createdAt = seed.createdAt ?? new Date(Date.now() - (index + 1) * 86_400_000).toISOString();
    const updatedAt = seed.updatedAt ?? createdAt;
    const status = normalizeStatus(seed.status ?? 'active');

    const limit = coerceLimit(seed.limit);
    const baseCode = seed.code ?? type.shortName ?? `PROMO-${index + 1}`;
    const normalizedCode = normalizeCode(baseCode) || `PROMO-${index + 1}`;
    const baseUsed = clampUsage(seed.used, limit);

    const seedSchedule = normalizeSchedule(seed.schedule ?? seed.params?.schedule ?? {});

    const params = seed.params ? { ...seed.params } : {};
    const normalizedAudienceFromSeed = normalizeAudienceParams(params.audience ?? seed.audience ?? null);
    if (normalizedAudienceFromSeed) {
      params.audience = normalizedAudienceFromSeed;
    } else if (params.audience) {
      delete params.audience;
    }

    const normalizedLimitsFromSeed = normalizeLimitsParams(params.limits ?? seed.limits ?? null);
    if (normalizedLimitsFromSeed) {
      params.limits = normalizedLimitsFromSeed;
    } else if (params.limits) {
      delete params.limits;
    }

    const normalizedDisplayFromSeed = normalizeDisplayParams(params.display ?? seed.display ?? null);
    if (normalizedDisplayFromSeed) {
      params.display = normalizedDisplayFromSeed;
    } else if (params.display) {
      delete params.display;
    }

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

    const seedActivations = normalizeActivations(seed.activations ?? params.activations ?? [], normalizedCode);
    const generatedActivations =
      seedActivations.length > 0 ? seedActivations : createSeedActivations(normalizedCode, baseUsed, limit);
    const activations = normalizeActivations(generatedActivations, normalizedCode);
    const used = activations.length > 0 ? clampUsage(activations.length, limit) : baseUsed;

    if (params.activations) {
      delete params.activations;
    }

    return {
      id: normalizedCode,
      typeId: type.id,
      code: normalizedCode,
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

export const seedRecords = () => {
  if (memory.isSeeded) {
    return cloneFromMemory();
  }

  const canonical = listCanonicalPromocodeRecords();
  if (canonical.length > 0) {
    captureRecordsInMemory(canonical);
    return cloneFromMemory();
  }

  const generated = generateRecordsFromDefinitions();
  storageAdapter.writeToStorage(generated);
  captureRecordsInMemory(generated);
  return cloneFromMemory();
};

export const ensureSeededRecords = () => seedRecords();

export const composePromocode = (record) => {
  if (!record) return null;
  const type = getPromoTypeById(record.typeId);
  const status = normalizeStatus(record.status);
  const limit = coerceLimit(record.limit);
  const activations = normalizeActivations(record.activations ?? record.params?.activations ?? [], record.code);
  const used = Math.max(activations.length, clampUsage(record.used, limit));

  const wager = toNullableNumber(record.wager, type?.seed?.wager ?? DEFAULT_PROMOCODE_WAGER);
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

  const audience = normalizeAudienceParams(params.audience ?? record.audience ?? null);
  if (audience) {
    params.audience = audience;
  } else if (params.audience) {
    delete params.audience;
  }

  const limits = normalizeLimitsParams(params.limits ?? record.limits ?? null);
  if (limits) {
    params.limits = limits;
  } else if (params.limits) {
    delete params.limits;
  }

  const display = normalizeDisplayParams(params.display ?? record.display ?? null);
  if (display) {
    params.display = display;
  } else if (params.display) {
    delete params.display;
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
    audience,
    limits,
    display,
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

export const updatePromocodeRecord = (idOrCode, mutator) => {
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
  captureRecordsInMemory(records);
  const composed = composePromocode(nextRecord);
  emitPromocodesChanged({ action: 'update', promocode: composed });
  return composed;
};

export const getPromocodeRecords = () => ensureSeededRecords();

export const mapAndSortPromocodes = () =>
  sortPromocodes(getPromocodeRecords())
    .map(composePromocode)
    .filter(Boolean);
