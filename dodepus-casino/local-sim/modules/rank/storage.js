import { RANK_LEVELS, RANK_REWARDS } from './constants.js';

const STORAGE_KEY = 'dodepus.rankRewards';

const memoryStore = {
  overrides: null,
};

const defaultRewardMap = new Map(RANK_REWARDS.map((reward) => [reward.level, reward]));
const levelMetaMap = new Map(RANK_LEVELS.map((level) => [level.level, level]));

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object ?? {}, key);

const tryGetLocalStorage = () => {
  try {
    if (typeof globalThis === 'undefined') return null;
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const normalizeColor = (value, fallback) => {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  const isValid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized);
  return isValid ? normalized.toLowerCase() : fallback;
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

  const badgeColor = hasOwn(source, 'badgeColor')
    ? normalizeColor(source.badgeColor, defaultReward.badgeColor)
    : defaultReward.badgeColor;

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
