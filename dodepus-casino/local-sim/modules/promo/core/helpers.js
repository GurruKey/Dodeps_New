import {
  ADMIN_PROMOCODES_EVENT,
  ADMIN_PROMOCODE_STATUS_LABELS,
} from '../constants.js';

const ALLOWED_STATUSES = new Set(Object.keys(ADMIN_PROMOCODE_STATUS_LABELS));

export const getEventTarget = () => {
  if (typeof window !== 'undefined') return window;
  if (typeof globalThis !== 'undefined' && globalThis?.addEventListener) {
    return globalThis;
  }
  return null;
};

export const createAbortError = (reason) => {
  if (reason instanceof Error) return reason;
  if (typeof DOMException === 'function') {
    return new DOMException('Aborted', 'AbortError');
  }
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
};

export const toNullablePositiveInt = (value, fallback = null) => {
  if (value == null || value === '') return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return fallback;
  return Math.floor(numeric);
};

export const toNullableNumber = (value, fallback = null) => {
  if (value == null || value === '') return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return numeric;
};

export const normalizeCode = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.replace(/\s+/g, '_').toUpperCase();
};

export const normalizeStatus = (value) => {
  if (typeof value !== 'string') return 'draft';
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 'draft';
  if (ALLOWED_STATUSES.has(normalized)) {
    return normalized;
  }
  return 'draft';
};

export const composeStatusLabel = (status) =>
  ADMIN_PROMOCODE_STATUS_LABELS[status] ?? ADMIN_PROMOCODE_STATUS_LABELS.draft;

export const coerceLimit = (limit) => {
  const normalized = toNullablePositiveInt(limit, null);
  if (normalized == null) return null;
  return normalized;
};

export const clampUsage = (used, limit) => {
  const normalizedUsed = toNullablePositiveInt(used, 0);
  const normalizedLimit = coerceLimit(limit);
  if (normalizedLimit == null) return normalizedUsed;
  return Math.min(normalizedUsed, normalizedLimit);
};

export const nowIso = () => new Date().toISOString();

export const toIsoDateTimeOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

export const normalizeSchedule = (schedule) => {
  if (!schedule || typeof schedule !== 'object') {
    return { startsAt: null, endsAt: null };
  }

  const startsAt =
    toIsoDateTimeOrNull(schedule.startsAt ?? schedule.start ?? schedule.from) ?? null;
  const endsAt = toIsoDateTimeOrNull(schedule.endsAt ?? schedule.end ?? schedule.until) ?? null;

  return { startsAt, endsAt };
};

export const normalizeActivations = (activations, code) => {
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

export const createSeedActivations = (code, used, limit) => {
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

export const normalizeRepeatParams = (repeat) => {
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

export const normalizeStringArray = (value) => {
  if (!value && value !== 0) return [];

  const source = Array.isArray(value)
    ? value
    : typeof value === 'string'
    ? value.split(/[\n,;]+/)
    : typeof value === 'number'
    ? [value]
    : [];

  const normalized = source
    .map((item) => {
      if (item == null) return null;
      const text = String(item).trim();
      if (!text) return null;
      return text;
    })
    .filter(Boolean);

  return [...new Set(normalized)];
};

export const normalizeAudienceParams = (audience) => {
  if (!audience || typeof audience !== 'object') return null;

  const normalized = {};

  const segments = normalizeStringArray(
    audience.segments ?? audience.segment ?? audience.groups ?? audience.group,
  );
  if (segments.length > 0) {
    normalized.segments = segments;
  }

  const countries = normalizeStringArray(
    audience.countries ?? audience.country ?? audience.geo ?? audience.regions,
  );
  if (countries.length > 0) {
    normalized.countries = countries;
  }

  const levels = normalizeStringArray(audience.levels ?? audience.level ?? audience.vipLevels);
  if (levels.length > 0) {
    normalized.levels = levels;
  }

  const tags = normalizeStringArray(audience.tags ?? audience.labels ?? audience.badges);
  if (tags.length > 0) {
    normalized.tags = tags;
  }

  const vipOnly = audience.vipOnly ?? audience.onlyVip ?? null;
  if (vipOnly != null) {
    normalized.vipOnly = Boolean(vipOnly);
  }

  const newPlayersOnly =
    audience.newPlayersOnly ?? audience.onlyNew ?? audience.isForNewbies ?? null;
  if (newPlayersOnly != null) {
    normalized.newPlayersOnly = Boolean(newPlayersOnly);
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
};

export const normalizeLimitsParams = (limits) => {
  if (!limits || typeof limits !== 'object') return null;

  const normalized = {};

  const minDeposit = toNullableNumber(
    limits.minDeposit ?? limits.depositMin ?? limits.minTopup,
    null,
  );
  if (minDeposit != null) {
    normalized.minDeposit = minDeposit;
  }

  const maxDeposit = toNullableNumber(
    limits.maxDeposit ?? limits.depositMax ?? limits.maxTopup,
    null,
  );
  if (maxDeposit != null) {
    normalized.maxDeposit = maxDeposit;
  }

  const minBalance = toNullableNumber(limits.minBalance ?? limits.balanceMin, null);
  if (minBalance != null) {
    normalized.minBalance = minBalance;
  }

  const maxBalance = toNullableNumber(limits.maxBalance ?? limits.balanceMax, null);
  if (maxBalance != null) {
    normalized.maxBalance = maxBalance;
  }

  const maxUsagePerClient = toNullablePositiveInt(
    limits.maxUsagePerClient ?? limits.usagePerClient ?? limits.perClient,
    null,
  );
  if (maxUsagePerClient != null) {
    normalized.maxUsagePerClient = maxUsagePerClient;
  }

  const allowedCurrencies = normalizeStringArray(
    limits.allowedCurrencies ?? limits.currencies ?? limits.currency,
  );
  if (allowedCurrencies.length > 0) {
    normalized.allowedCurrencies = allowedCurrencies;
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
};

export const normalizeDisplayParams = (display) => {
  if (!display || typeof display !== 'object') return null;

  const normalized = {};

  const highlight = display.highlight ?? display.isHighlighted ?? null;
  if (highlight != null) {
    normalized.highlight = Boolean(highlight);
  }

  const showOnMain = display.showOnMain ?? display.onMain ?? null;
  if (showOnMain != null) {
    normalized.showOnMain = Boolean(showOnMain);
  }

  const showInStore = display.showInStore ?? display.inStore ?? display.inCatalog ?? null;
  if (showInStore != null) {
    normalized.showInStore = Boolean(showInStore);
  }

  const channels = normalizeStringArray(display.channels ?? display.placements ?? display.channel);
  if (channels.length > 0) {
    normalized.channels = channels;
  }

  if (typeof display.highlightColor === 'string' && display.highlightColor.trim()) {
    normalized.highlightColor = display.highlightColor.trim();
  } else if (typeof display.color === 'string' && display.color.trim()) {
    normalized.highlightColor = display.color.trim();
  }

  if (typeof display.badgeText === 'string' && display.badgeText.trim()) {
    normalized.badgeText = display.badgeText.trim();
  }

  if (typeof display.description === 'string' && display.description.trim()) {
    normalized.description = display.description.trim();
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
};

export const sortPromocodes = (records) => {
  const copy = Array.isArray(records) ? [...records] : [];
  copy.sort((a, b) => {
    const timeA = a.updatedAt ? Date.parse(a.updatedAt) : a.createdAt ? Date.parse(a.createdAt) : 0;
    const timeB = b.updatedAt ? Date.parse(b.updatedAt) : b.createdAt ? Date.parse(b.createdAt) : 0;
    return timeB - timeA;
  });
  return copy;
};

export { ADMIN_PROMOCODES_EVENT };
