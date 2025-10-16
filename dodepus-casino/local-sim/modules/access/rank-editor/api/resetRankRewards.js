import { adminResetRankRewards } from '../../../rank/api.js';

export const resetAdminRankRewards = async () => adminResetRankRewards().map((item) => ({ ...item }));
