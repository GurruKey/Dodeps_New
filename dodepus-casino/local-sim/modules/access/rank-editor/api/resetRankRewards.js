import { adminResetRankRewards } from '../../../rank/index.js';

export const resetAdminRankRewards = async () => adminResetRankRewards().map((item) => ({ ...item }));
