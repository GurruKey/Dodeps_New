import { getRankRewards, getRankLevels } from '../../../rank/index.js';

export const listAdminRankRewards = async () => ({
  rewards: getRankRewards(),
  levels: getRankLevels(),
});
