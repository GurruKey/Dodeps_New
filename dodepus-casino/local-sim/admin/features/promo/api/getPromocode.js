import { composePromocode, ensureSeededRecords } from '../core/repository.js';

export const getAdminPromocodeById = (idOrCode) => {
  const records = ensureSeededRecords();
  const record = records.find((item) => item.code === idOrCode || item.id === idOrCode);
  if (!record) return null;
  return composePromocode(record);
};
