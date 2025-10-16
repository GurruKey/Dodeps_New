import { getLocalDatabase } from '../../database/engine.js';
import { RANK_LEVELS_TABLE, RANK_REWARDS_TABLE } from './constants.js';

const cloneDeep = (value) => {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // fallback to JSON stringify
    }
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const toTrimmedString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const toSlug = (value, level) => {
  const base = toTrimmedString(value).toLowerCase();
  if (base) {
    const slug = base
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');
    if (slug) {
      return slug === 'vip' && Number.isInteger(level) ? `vip-${level}` : slug;
    }
  }
  if (Number.isInteger(level)) {
    return level === 0 ? 'user' : `vip-${level}`;
  }
  return 'vip';
};

const toNonNegativeInt = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }
  return Math.floor(numeric);
};

const toBadgeSpeed = (value, fallback = 6) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  const clamped = Math.min(Math.max(numeric, 2), 12);
  return Math.round(clamped * 10) / 10;
};

const normalizeHexColor = (value, fallback = '#adb5bd') => {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return fallback;
  }
  const prefixed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(prefixed)) {
    return fallback;
  }
  if (prefixed.length === 4) {
    const [, r, g, b] = prefixed;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return prefixed;
};

const toMultiline = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/\r\n/g, '\n').trim();
};

const toIsoString = (value) => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? trimmed : date.toISOString();
  }
  return null;
};

const sortByLevel = (a, b) => {
  if (a.level !== b.level) {
    return a.level - b.level;
  }
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
};

const mapRankLevelRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const level = toNonNegativeInt(row.level ?? row.tier ?? 0, 0);
  const id = toTrimmedString(row.id) || `rank_level_${String(level).padStart(3, '0')}`;
  const label = toTrimmedString(row.label) || (Number.isInteger(level) ? `VIP ${level}` : 'VIP');
  const shortLabel = toTrimmedString(row.short_label ?? row.shortLabel) || label;

  return {
    id,
    level,
    slug: toSlug(row.slug ?? row.name ?? label, level),
    label,
    shortLabel,
    group: toTrimmedString(row.group ?? row.rank_group) || 'vip',
    tier: toNonNegativeInt(row.tier ?? level, level),
    depositStep: toNonNegativeInt(row.deposit_step ?? row.depositStep ?? 0, 0),
    totalDeposit: toNonNegativeInt(row.total_deposit ?? row.totalDeposit ?? 0, 0),
    sortOrder: toNonNegativeInt(row.sort_order ?? row.sortOrder ?? level, level),
    createdAt: toIsoString(row.created_at ?? row.createdAt),
    updatedAt: toIsoString(row.updated_at ?? row.updatedAt),
  };
};

const mapRankRewardRow = (row, lookups) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const level = toNonNegativeInt(row.level ?? row.rank_level ?? row.tier ?? 0, null);
  if (!Number.isInteger(level)) {
    return null;
  }

  const rawRankLevelId = toTrimmedString(row.rank_level_id ?? row.rankLevelId);
  const rankLevelId = rawRankLevelId || lookups.byLevel.get(level)?.id || null;
  if (!rankLevelId) {
    return null;
  }

  const id = toTrimmedString(row.id) || `rank_reward_${String(level).padStart(3, '0')}`;
  const badgeColor = normalizeHexColor(row.badge_color ?? row.badgeColor, '#adb5bd');
  const badgeColorSecondary = normalizeHexColor(
    row.badge_color_secondary ?? row.badgeColorSecondary,
    badgeColor,
  );
  const badgeColorTertiary = normalizeHexColor(
    row.badge_color_tertiary ?? row.badgeColorTertiary,
    badgeColorSecondary,
  );
  const badgeTextColor = normalizeHexColor(row.badge_text_color ?? row.badgeTextColor, '#212529');
  const badgeEffect = toTrimmedString(row.badge_effect ?? row.badgeEffect).toLowerCase() || 'solid';

  return {
    id,
    rankLevelId,
    level,
    label: toTrimmedString(row.label) || `VIP ${level}`,
    badgeColor,
    badgeColorSecondary,
    badgeColorTertiary,
    badgeTextColor,
    badgeEffect,
    badgeEffectSpeed: toBadgeSpeed(row.badge_effect_speed ?? row.badgeEffectSpeed, 6),
    tagline: toMultiline(row.tagline),
    description: toMultiline(row.description),
    purpose: toMultiline(row.purpose),
    createdAt: toIsoString(row.created_at ?? row.createdAt),
    updatedAt: toIsoString(row.updated_at ?? row.updatedAt),
  };
};

const buildLevelLookups = (levels) => {
  const byLevel = new Map();
  levels.forEach((level) => {
    byLevel.set(level.level, level);
  });
  return { byLevel };
};

export const listDefaultRankLevels = () => {
  const db = getLocalDatabase();
  const rows = db.select(RANK_LEVELS_TABLE).map((row) => mapRankLevelRow(row)).filter(Boolean);
  rows.sort(sortByLevel);
  return rows.map((row) => cloneDeep(row));
};

export const listDefaultRankRewards = (options = {}) => {
  const db = getLocalDatabase();
  const preloadedLevels = Array.isArray(options.levels) ? options.levels : null;
  const levels = preloadedLevels ? preloadedLevels.map((level) => ({ ...level })) : listDefaultRankLevels();
  const lookups = buildLevelLookups(levels);
  const rows = db
    .select(RANK_REWARDS_TABLE)
    .map((row) => mapRankRewardRow(row, lookups))
    .filter(Boolean)
    .sort(sortByLevel);
  return rows.map((row) => cloneDeep(row));
};

export const getDefaultRankRewardByLevel = (level) => {
  const rewards = listDefaultRankRewards();
  return rewards.find((reward) => reward.level === level) || null;
};
