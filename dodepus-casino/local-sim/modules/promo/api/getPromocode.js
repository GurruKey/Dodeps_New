import { composePromocode, ensureSeededRecords } from '../core/index.js';

export const getAdminPromocodeById = (idOrCode) => {
  const records = ensureSeededRecords();
  const record = records.find((item) => item.id === idOrCode || item.code === idOrCode);
  if (!record) {
    return null;
  }
  return composePromocode(record);
};
