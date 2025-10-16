import { getRankRewards, getRankLevels } from '../../../rank/api.js';

export const listAdminRankRewards = async () => ({
  rewards: getRankRewards(),
  levels: getRankLevels(),
});
