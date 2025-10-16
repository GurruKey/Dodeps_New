import {
  DEFAULT_PROMOCODE_CASHOUT_CAP,
  DEFAULT_PROMOCODE_WAGER,
} from '../constants.js';
import { getPromoTypeById } from '../definitions/index.js';
import { storageAdapter } from '../storage.js';
import {
  coerceLimit,
  normalizeAudienceParams,
  normalizeDisplayParams,
  normalizeLimitsParams,
  normalizeRepeatParams,
  normalizeSchedule,
  normalizeStatus,
  normalizeCode,
  nowIso,
  toIsoDateTimeOrNull,
  toNullableNumber,
} from '../core/helpers.js';
import {
  composePromocode,
  ensureSeededRecords,
} from '../core/repository.js';
import { emitPromocodesChanged } from '../core/events.js';

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
    typeof input?.title === 'string' && input.title.trim() ? input.title.trim() : type.name ?? code;
  const reward =
    typeof input?.reward === 'string' && input.reward.trim() ? input.reward.trim() : type.seed?.reward ?? '';

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

  const audienceParams = normalizeAudienceParams(
    input?.audience ?? input?.params?.audience ?? params.audience ?? null,
  );
  if (audienceParams) {
    params.audience = audienceParams;
  } else if (params.audience) {
    delete params.audience;
  }

  const limitsParams = normalizeLimitsParams(
    input?.limits ?? input?.params?.limits ?? params.limits ?? null,
  );
  if (limitsParams) {
    params.limits = limitsParams;
  } else if (params.limits) {
    delete params.limits;
  }

  const displayParams = normalizeDisplayParams(
    input?.display ?? input?.params?.display ?? params.display ?? null,
  );
  if (displayParams) {
    params.display = displayParams;
  } else if (params.display) {
    delete params.display;
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
