import { pickExtras } from './profileExtras.js';
import { availableRoles } from '../access/index.js';
import {
  getRankDefinitions,
  getRankDefinitionById,
  getRankBenefitTemplate as loadRankBenefitTemplate,
} from '../rank/index.js';

const collectRoles = (...sources) => {
  const normalized = [];

  const pushValue = (value) => {
    if (typeof value !== 'string') return;
    const trimmed = value.trim();
    if (!trimmed) return;
    const lowered = trimmed.toLowerCase();
    if (!normalized.includes(lowered)) {
      normalized.push(lowered);
    }
  };

  sources.forEach((source) => {
    if (!source) return;
    if (Array.isArray(source)) {
      source.forEach(pushValue);
      return;
    }
    pushValue(source);
  });

  if (!normalized.includes('user')) {
    normalized.push('user');
  }

  return normalized;
};

const listAvailableRanks = () => getRankDefinitions();

export const isAdminUser = (user) =>
  Boolean(
    user?.isAdmin || (Array.isArray(user?.roles) && user.roles.includes('admin'))
  );

const resolveAdminFlag = (record, extras) => {
  if (!record) return Boolean(extras?.isAdmin);
  const appRoles = record?.app_metadata?.roles;
  const metadataRole = record?.user_metadata?.role;
  return (
    Boolean(extras?.isAdmin) ||
    record?.isAdmin === true ||
    (Array.isArray(appRoles) && appRoles.includes('admin')) ||
    metadataRole === 'admin' ||
    Boolean(record?.user_metadata?.isAdmin)
  );
};

const resolveRoleId = (record, extras) => {
  const directValues = [
    record?.roleId,
    record?.user_metadata?.roleId,
    record?.app_metadata?.roleId,
    extras?.roleId,
  ];

  for (const value of directValues) {
    if (!value) continue;
    const candidate = availableRoles.find((role) => role.id === value);
    if (candidate) {
      return candidate.id;
    }
  }

  const group =
    record?.role ||
    record?.app_metadata?.role ||
    record?.user_metadata?.role ||
    extras?.role ||
    null;

  if (!group) return null;

  const levelValues = [
    record?.roleLevel,
    record?.app_metadata?.roleLevel,
    record?.app_metadata?.level,
    record?.user_metadata?.roleLevel,
    record?.user_metadata?.level,
    extras?.roleLevel,
  ].filter((value) => typeof value === 'number' && Number.isFinite(value));

  const level = levelValues.length ? levelValues[0] : null;

  const match = availableRoles.find((role) => {
    if (role.group !== group) return false;
    if (typeof role.level === 'number') {
      return level !== null && role.level === level;
    }
    return level === null;
  });

  return match?.id ?? null;
};

const getRankConfig = (rankId) => {
  if (!rankId) return null;
  return getRankDefinitionById(rankId);
};

const resolveRankId = (record, extras) => {
  const directValues = [
    record?.playerRankId,
    record?.user_metadata?.playerRankId,
    record?.app_metadata?.playerRankId,
    extras?.playerRankId,
    record?.user_metadata?.rankId,
    record?.app_metadata?.rankId,
  ];

  for (const value of directValues) {
    if (!value) continue;
    const candidate = getRankConfig(value);
    if (candidate) {
      return candidate.id;
    }
  }

  const ranks = listAvailableRanks();
  const defaultRank = ranks.find((rank) => rank.level === 0) ?? ranks[0] ?? null;
  return defaultRank?.id ?? 'user';
};

const resolveRankTier = (record, extras, rankId) => {
  const tierValues = [
    record?.playerRankTier,
    record?.user_metadata?.playerRankTier,
    record?.app_metadata?.playerRankTier,
    record?.user_metadata?.tier,
    record?.app_metadata?.tier,
    extras?.playerRankTier,
  ].filter((value) => typeof value === 'number' && Number.isFinite(value));

  if (tierValues.length) {
    return tierValues[0];
  }

  const config = getRankConfig(rankId);
  return typeof config?.tier === 'number' ? config.tier : null;
};

const getRankBenefitTemplate = (rankId) => {
  const template = loadRankBenefitTemplate(rankId);
  if (!template || typeof template !== 'object') {
    return {};
  }

  return Object.entries(template).reduce((acc, [key, value]) => {
    acc[key] = Boolean(value);
    return acc;
  }, {});
};

const resolveRankBenefits = (record, extras, rankId) => {
  const template = getRankBenefitTemplate(rankId);
  const sources = [
    template,
    record?.playerRankBenefits,
    record?.user_metadata?.playerRankBenefits,
    record?.app_metadata?.playerRankBenefits,
    extras?.playerRankBenefits,
  ];

  const merged = {};

  sources.forEach((source) => {
    if (!source || typeof source !== 'object') return;
    Object.entries(source).forEach(([key, value]) => {
      merged[key] = Boolean(value);
    });
  });

  return merged;
};

export function composeUser(record, extras) {
  if (!record) return null;
  const emailVerified =
    Boolean(record.email_confirmed_at) ||
    Boolean(record.confirmed_at) ||
    Boolean(extras?.emailVerified);

  const roles = collectRoles(
    record?.app_metadata?.roles,
    record?.roles,
    record?.user_metadata?.roles,
    extras?.roles,
    record?.roleId,
    record?.app_metadata?.roleId,
    record?.user_metadata?.roleId,
    extras?.roleId,
  );

  const role =
    record?.role ||
    record?.app_metadata?.role ||
    record?.user_metadata?.role ||
    extras?.role ||
    roles[0] ||
    'user';

  const playerRankId = resolveRankId(record, extras);
  const playerRankTier = resolveRankTier(record, extras, playerRankId);
  const playerRankBenefits = resolveRankBenefits(record, extras, playerRankId);
  const playerRankConfig = getRankConfig(playerRankId);

  return {
    id: record.id,
    email: record.email ?? '',
    phone: record.phone ?? '',
    createdAt: record.created_at ?? null,
    app_metadata: record.app_metadata ?? {},
    user_metadata: record.user_metadata ?? {},
    roles,
    role,
    roleId: resolveRoleId(record, extras),
    isAdmin: resolveAdminFlag(record, extras),
    playerRankId,
    playerRank: playerRankConfig?.group ?? 'player',
    playerRankName: playerRankConfig?.name ?? playerRankId,
    playerRankTier: playerRankTier ?? undefined,
    playerRankBenefits,
    playerRankBadgeColor: playerRankConfig?.badgeColor,
    playerRankPurpose: playerRankConfig?.purpose,
    ...pickExtras({ ...extras, emailVerified, email: record.email, phone: record.phone }),
  };
}

