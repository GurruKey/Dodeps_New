import { getRankRewards, getRankLevels } from '../../../../../modules/rank/api.js';

export const listAdminRankRewards = async () => ({
  rewards: getRankRewards(),
  levels: getRankLevels(),
});
