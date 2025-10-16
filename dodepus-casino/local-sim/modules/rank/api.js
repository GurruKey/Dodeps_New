import { loadExtras } from '../auth/profileExtras.js';
import { RANK_LEVELS } from './constants.js';
import { resolveRankProgress } from './helpers.js';
import {
  loadRankRewards,
  updateRankReward,
  resetRankRewards,
  listRankDefinitions,
  findRankDefinitionById,
  getRankBenefitTemplate as loadRankBenefitTemplate,
} from './storage.js';


const toTransactions = (source) => (Array.isArray(source) ? source : []);

const normalizeString = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const toAmount = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const isSuccessfulDeposit = (txn) => {
  if (!txn || typeof txn !== 'object') {
    return false;
  }
  const type = normalizeString(txn.type);
  if (type !== 'deposit') {
    return false;
  }
  const status = normalizeString(txn.status);
  if (['failed', 'canceled', 'cancelled', 'rejected'].includes(status)) {
    return false;
  }
  return true;
};

export const getRankLevels = () => RANK_LEVELS.map((level) => ({ ...level }));

export const getRankRewards = () => loadRankRewards().map((reward) => ({ ...reward }));

export const getRankDefinitions = () => listRankDefinitions().map((definition) => ({ ...definition }));

export const getRankDefinitionById = (rankId) => {
  const definition = findRankDefinitionById(rankId);
  return definition ? { ...definition } : null;
};

export const getRankBenefitTemplate = (rankId) => {
  const template = loadRankBenefitTemplate(rankId);
  if (!template || typeof template !== 'object') {
    return {};
  }
  return { ...template };
};

const mergeRewardMeta = (levelData, reward) => {
  if (!levelData) {
    return null;
  }

  if (!reward) {
    return { ...levelData };
  }

  return {
    ...levelData,
    badgeColor: reward.badgeColor,
    badgeColorSecondary: reward.badgeColorSecondary,
    badgeColorTertiary: reward.badgeColorTertiary,
    badgeTextColor: reward.badgeTextColor,
    badgeEffect: reward.badgeEffect,
    badgeEffectSpeed: reward.badgeEffectSpeed,
    rewardTitle: reward.title,
    tagline: reward.tagline,
    purpose: reward.purpose,
  };
};

export const getProfileRankSummary = (userId, rewardsCache) => {
  const extras = loadExtras(userId);
  const totalDeposits = toTransactions(extras?.transactions).reduce((sum, txn) => {
    if (!isSuccessfulDeposit(txn)) {
      return sum;
    }
    return sum + toAmount(txn.amount);
  }, 0);

  const progress = resolveRankProgress(totalDeposits);
  const rewards = Array.isArray(rewardsCache) ? rewardsCache : loadRankRewards();

  const currentReward = rewards.find((reward) => reward.level === progress?.currentLevel?.level) ?? null;
  const nextReward = rewards.find((reward) => reward.level === progress?.nextLevel?.level) ?? null;

  return {
    ...progress,
    currency: extras?.currency || 'USD',
    currentLevel: mergeRewardMeta(progress?.currentLevel ?? null, currentReward),
    nextLevel: mergeRewardMeta(progress?.nextLevel ?? null, nextReward),
  };
};

export const getProfileRankData = (userId) => {
  const rewards = getRankRewards();

  return {
    rewards,
    summary: getProfileRankSummary(userId, rewards),
    levels: getRankLevels(),
  };
};

export const adminUpdateRankReward = (payload) => updateRankReward(payload?.level, payload);

export const adminResetRankRewards = () => resetRankRewards();
