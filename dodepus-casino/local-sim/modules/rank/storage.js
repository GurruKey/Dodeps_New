import { RANK_LEVELS, RANK_REWARDS } from './constants.js';

const STORAGE_KEY = 'dodepus.rankRewards';

const memoryStore = {
  overrides: null,
};

const defaultRewardMap = new Map(RANK_REWARDS.map((reward) => [reward.level, reward]));
const levelMetaMap = new Map(RANK_LEVELS.map((level) => [level.level, level]));

const DEFAULT_BADGE_COLOR = '#adb5bd';
const DEFAULT_TEXT_LIGHT = '#ffffff';
const DEFAULT_TEXT_DARK = '#212529';
const DEFAULT_EFFECT = 'solid';
const DEFAULT_EFFECT_SPEED = 6;

const BADGE_EFFECTS = new Set(['solid', 'gradient', 'rainbow', 'breathing', 'pulse', 'glow', 'shine']);

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object ?? {}, key);

const tryGetLocalStorage = () => {
  try {
    if (typeof globalThis === 'undefined') return null;
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const normalizeColorInternal = (value) => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(normalized)) {
    return null;
  }
  if (normalized.length === 4) {
    const [, r, g, b] = normalized;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return normalized;
};

const normalizeColor = (value, fallback) =>
  normalizeColorInternal(value) ?? normalizeColorInternal(fallback) ?? DEFAULT_BADGE_COLOR;

const toRgb = (hexColor) => {
  const normalized = normalizeColorInternal(hexColor);
  if (!normalized) {
    return null;
  }
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }
  return { r, g, b };
};

const resolveAutoTextColor = (hexColor) => {
  const rgb = toRgb(hexColor);
  if (!rgb) {
    return DEFAULT_TEXT_LIGHT;
  }
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.65 ? DEFAULT_TEXT_DARK : DEFAULT_TEXT_LIGHT;
};

const normalizeBadgeEffect = (value, fallback = DEFAULT_EFFECT) => {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim().toLowerCase();
  if (BADGE_EFFECTS.has(trimmed)) {
    return trimmed;
  }
  return fallback;
};

const normalizeBadgeSpeed = (value, fallback = DEFAULT_EFFECT_SPEED) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  const clamped = Math.min(Math.max(numeric, 2), 12);
  return Math.round(clamped * 10) / 10;
};

const normalizeMultiline = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/\r\n/g, '\n').trim();
};

const sanitizeStoredOverrides = (records) => {
  if (!Array.isArray(records)) {
    return [];
  }

  return records.reduce((acc, record) => {
    const level = Number(record?.level);
    if (!Number.isInteger(level) || !defaultRewardMap.has(level)) {
      return acc;
    }

    const sanitized = { level };

    if (hasOwn(record, 'badgeColor')) {
      sanitized.badgeColor = record.badgeColor;
    }
    if (hasOwn(record, 'badgeColorSecondary')) {
      sanitized.badgeColorSecondary = record.badgeColorSecondary;
    }
    if (hasOwn(record, 'badgeColorTertiary')) {
      sanitized.badgeColorTertiary = record.badgeColorTertiary;
    }
    if (hasOwn(record, 'badgeTextColor')) {
      sanitized.badgeTextColor = record.badgeTextColor;
    }
    if (hasOwn(record, 'badgeEffect')) {
      sanitized.badgeEffect = record.badgeEffect;
    }
    if (hasOwn(record, 'badgeEffectSpeed')) {
      sanitized.badgeEffectSpeed = record.badgeEffectSpeed;
    }
    if (hasOwn(record, 'tagline')) {
      sanitized.tagline = record.tagline;
    }
    if (hasOwn(record, 'description')) {
      sanitized.description = record.description;
    }
    if (hasOwn(record, 'purpose')) {
      sanitized.purpose = record.purpose;
    }

    acc.push(sanitized);
    return acc;
  }, []);
};

const readOverrides = () => {
  if (Array.isArray(memoryStore.overrides)) {
    return memoryStore.overrides;
  }

  const storage = tryGetLocalStorage();
  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryStore.overrides = sanitizeStoredOverrides(parsed);
        return memoryStore.overrides;
      }
    } catch (error) {
      console.warn('Failed to read rank rewards from localStorage', error);
    }
  }

  memoryStore.overrides = [];
  return memoryStore.overrides;
};

const writeOverrides = (records) => {
  const normalized = sanitizeStoredOverrides(records);
  memoryStore.overrides = normalized;

  const storage = tryGetLocalStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn('Failed to write rank rewards to localStorage', error);
  }
};

const composeReward = (defaultReward, source = {}) => {
  if (!defaultReward) {
    throw new Error('Default reward is required');
  }

  const defaultBadgeColor = normalizeColor(defaultReward.badgeColor, DEFAULT_BADGE_COLOR);
  const badgeColor = hasOwn(source, 'badgeColor')
    ? normalizeColor(source.badgeColor, defaultBadgeColor)
    : defaultBadgeColor;

  const defaultBadgeColorSecondary = normalizeColor(defaultReward.badgeColorSecondary, badgeColor);
  const badgeColorSecondary = hasOwn(source, 'badgeColorSecondary')
    ? normalizeColor(source.badgeColorSecondary, badgeColor)
    : defaultBadgeColorSecondary;

  const defaultBadgeColorTertiary = normalizeColor(defaultReward.badgeColorTertiary, badgeColorSecondary);
  const badgeColorTertiary = hasOwn(source, 'badgeColorTertiary')
    ? normalizeColor(source.badgeColorTertiary, badgeColorSecondary)
    : defaultBadgeColorTertiary;

  const defaultBadgeEffect = normalizeBadgeEffect(defaultReward.badgeEffect, DEFAULT_EFFECT);
  const badgeEffect = hasOwn(source, 'badgeEffect')
    ? normalizeBadgeEffect(source.badgeEffect, defaultBadgeEffect)
    : defaultBadgeEffect;

  const defaultEffectSpeed = normalizeBadgeSpeed(defaultReward.badgeEffectSpeed, DEFAULT_EFFECT_SPEED);
  const badgeEffectSpeed = hasOwn(source, 'badgeEffectSpeed')
    ? normalizeBadgeSpeed(source.badgeEffectSpeed, defaultEffectSpeed)
    : defaultEffectSpeed;

  const fallbackTextColor =
    normalizeColorInternal(defaultReward.badgeTextColor) ?? resolveAutoTextColor(badgeColor);
  const badgeTextColor = hasOwn(source, 'badgeTextColor')
    ? normalizeColor(source.badgeTextColor, fallbackTextColor)
    : normalizeColor(defaultReward.badgeTextColor, fallbackTextColor);

  const tagline = hasOwn(source, 'tagline')
    ? normalizeMultiline(source.tagline)
    : defaultReward.tagline;

  const description = hasOwn(source, 'description')
    ? normalizeMultiline(source.description)
    : defaultReward.description;

  const purpose = hasOwn(source, 'purpose')
    ? normalizeMultiline(source.purpose)
    : defaultReward.purpose;

  return {
    level: defaultReward.level,
    label: defaultReward.label,
    badgeColor,
    badgeColorSecondary,
    badgeColorTertiary,
    badgeTextColor,
    badgeEffect,
    badgeEffectSpeed,
    tagline,
    description,
    purpose,
  };
};

const composeTitle = (reward) => {
  const tagline = normalizeMultiline(reward?.tagline ?? '').trim();
  if (tagline) {
    return `${reward.label} — ${tagline}`;
  }
  return reward.label;
};

const enrichReward = (reward) => ({
  ...reward,
  title: composeTitle(reward),
  displayTitle: composeTitle(reward),
});

const extractOverridePayload = (reward, defaultReward) => {
  const payload = { level: reward.level };

  if (reward.badgeColor !== defaultReward.badgeColor) {
    payload.badgeColor = reward.badgeColor;
  }
  if (reward.badgeColorSecondary !== defaultReward.badgeColorSecondary) {
    payload.badgeColorSecondary = reward.badgeColorSecondary;
  }
  if (reward.badgeColorTertiary !== defaultReward.badgeColorTertiary) {
    payload.badgeColorTertiary = reward.badgeColorTertiary;
  }
  if (reward.badgeTextColor !== defaultReward.badgeTextColor) {
    payload.badgeTextColor = reward.badgeTextColor;
  }
  if (reward.badgeEffect !== defaultReward.badgeEffect) {
    payload.badgeEffect = reward.badgeEffect;
  }
  if (reward.badgeEffectSpeed !== defaultReward.badgeEffectSpeed) {
    payload.badgeEffectSpeed = reward.badgeEffectSpeed;
  }
  if (reward.tagline !== defaultReward.tagline) {
    payload.tagline = reward.tagline;
  }
  if (reward.description !== defaultReward.description) {
    payload.description = reward.description;
  }
  if (reward.purpose !== defaultReward.purpose) {
    payload.purpose = reward.purpose;
  }

  return Object.keys(payload).length > 1 ? payload : null;
};

const sortByLevel = (a, b) => a.level - b.level;

const normalizeRankId = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return '';
  }

  if (trimmed === 'user') {
    return 'user';
  }

  const replaced = trimmed.replace(/\s+/g, '-');
  if (/^vip-\d+$/.test(replaced)) {
    return replaced;
  }
  if (/^vip\d+$/.test(replaced)) {
    return replaced.replace(/^vip/, 'vip-');
  }
  return replaced;
};

const buildRankId = (level) => (level === 0 ? 'user' : `vip-${level}`);

const composeRankDefinition = (reward) => {
  const meta = levelMetaMap.get(reward.level) ?? null;
  const id = buildRankId(reward.level);

  return {
    id,
    level: reward.level,
    label: reward.label,
    shortLabel: meta?.shortLabel ?? reward.label,
    name: reward.tagline ? `${reward.label} — ${reward.tagline}` : reward.label,
    group: 'vip',
    tier: reward.level,
    description: reward.description ?? '',
    purpose: reward.purpose ?? '',
    badgeColor: reward.badgeColor,
    badgeColorSecondary: reward.badgeColorSecondary,
    badgeColorTertiary: reward.badgeColorTertiary,
    badgeTextColor: reward.badgeTextColor,
    badgeEffect: reward.badgeEffect,
    badgeEffectSpeed: reward.badgeEffectSpeed,
    depositStep: meta?.depositStep ?? 0,
    totalDeposit: meta?.totalDeposit ?? 0,
  };
};

export const loadRankRewards = () => {
  const overrides = readOverrides();

  const result = RANK_REWARDS.map((defaultReward) => {
    const override = overrides.find((record) => record.level === defaultReward.level) ?? {};
    return enrichReward(composeReward(defaultReward, override));
  }).sort(sortByLevel);

  return result;
};

export const updateRankReward = (levelInput, patch = {}) => {
  const level = Number(levelInput);
  if (!Number.isInteger(level) || !defaultRewardMap.has(level)) {
    throw new Error('Указан неизвестный уровень ранга');
  }

  const overrides = readOverrides();
  const defaultReward = defaultRewardMap.get(level);

  const existingOverrideIndex = overrides.findIndex((record) => record.level === level);
  const existingOverride = existingOverrideIndex >= 0 ? overrides[existingOverrideIndex] : {};

  const nextSource = { ...existingOverride };
  if (hasOwn(patch, 'badgeColor')) {
    nextSource.badgeColor = patch.badgeColor;
  }
  if (hasOwn(patch, 'badgeColorSecondary')) {
    nextSource.badgeColorSecondary = patch.badgeColorSecondary;
  }
  if (hasOwn(patch, 'badgeColorTertiary')) {
    nextSource.badgeColorTertiary = patch.badgeColorTertiary;
  }
  if (hasOwn(patch, 'badgeTextColor')) {
    nextSource.badgeTextColor = patch.badgeTextColor;
  }
  if (hasOwn(patch, 'badgeEffect')) {
    nextSource.badgeEffect = patch.badgeEffect;
  }
  if (hasOwn(patch, 'badgeEffectSpeed')) {
    nextSource.badgeEffectSpeed = patch.badgeEffectSpeed;
  }
  if (hasOwn(patch, 'tagline')) {
    nextSource.tagline = patch.tagline;
  }
  if (hasOwn(patch, 'description')) {
    nextSource.description = patch.description;
  }
  if (hasOwn(patch, 'purpose')) {
    nextSource.purpose = patch.purpose;
  }

  const nextReward = composeReward(defaultReward, nextSource);
  const defaultRewardSnapshot = composeReward(defaultReward, {});

  const payload = extractOverridePayload(nextReward, defaultRewardSnapshot);

  const nextOverrides = overrides.filter((record) => record.level !== level);
  if (payload) {
    nextOverrides.push(payload);
  }

  writeOverrides(nextOverrides);

  const records = loadRankRewards();
  const record = records.find((item) => item.level === level) ?? enrichReward(composeReward(defaultReward, {}));

  return { record, records };
};

export const resetRankRewards = () => {
  writeOverrides([]);
  return loadRankRewards();
};

export const listRankDefinitions = () => loadRankRewards().map(composeRankDefinition);

export const findRankDefinitionById = (rankId) => {
  const normalizedId = normalizeRankId(rankId);
  if (!normalizedId) {
    return null;
  }

  const definitions = listRankDefinitions();
  return (
    definitions.find((definition) => {
      if (!definition?.id) return false;
      if (normalizeRankId(definition.id) === normalizedId) {
        return true;
      }
      return normalizeRankId(buildRankId(definition.level)) === normalizedId;
    }) ?? null
  );
};

export const getRankBenefitTemplate = () => ({});
