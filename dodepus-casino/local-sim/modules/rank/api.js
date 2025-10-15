import { loadExtras } from '../../auth/profileExtras.js';
import { RANK_LEVELS, RANK_REWARDS } from './constants.js';
import { resolveRankProgress } from './helpers.js';


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

export const getRankRewards = () => RANK_REWARDS.map((reward) => ({ ...reward }));

export const getProfileRankSummary = (userId) => {
  const extras = loadExtras(userId);
  const totalDeposits = toTransactions(extras?.transactions).reduce((sum, txn) => {
    if (!isSuccessfulDeposit(txn)) {
      return sum;
    }
    return sum + toAmount(txn.amount);
  }, 0);

  const progress = resolveRankProgress(totalDeposits);

  return {
    ...progress,
    currency: extras?.currency || 'USD',
  };
};

export const getProfileRankData = (userId) => ({
  summary: getProfileRankSummary(userId),
  levels: getRankLevels(),
  rewards: getRankRewards(),
});
