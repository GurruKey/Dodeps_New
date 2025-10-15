import { adminUpdateRankReward } from '../../../../../modules/rank/api.js';

const ensureLevel = (value) => {
  const level = Number(value);
  if (!Number.isInteger(level)) {
    throw new Error('Укажите корректный уровень ранга');
  }
  return level;
};

export const updateAdminRankReward = async (payload = {}) => {
  const level = ensureLevel(payload.level);

  const request = { level };

  if (Object.prototype.hasOwnProperty.call(payload, 'badgeColor')) {
    request.badgeColor = payload.badgeColor;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'tagline')) {
    request.tagline = payload.tagline;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
    request.description = payload.description;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'purpose')) {
    request.purpose = payload.purpose;
  }

  const result = adminUpdateRankReward(request);
  return {
    record: { ...result.record },
    records: result.records.map((item) => ({ ...item })),
  };
};
