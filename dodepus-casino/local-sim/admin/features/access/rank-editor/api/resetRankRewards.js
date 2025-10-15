import { adminResetRankRewards } from '../../../../../modules/rank/api.js';

export const resetAdminRankRewards = async () => adminResetRankRewards().map((item) => ({ ...item }));
