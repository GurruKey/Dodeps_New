export {
  notifyAdminPromocodesChanged,
  subscribeToAdminPromocodes,
} from './core/index.js';
export {
  listAdminPromocodes,
  listAdminArchivedPromocodes,
  createAdminPromocode,
  getAdminPromocodeById,
  pauseAdminPromocode,
  resumeAdminPromocode,
  archiveAdminPromocode,
  extendAdminPromocodeEndsAt,
} from './api/index.js';
export {
  promoTypeDefinitions,
  promoTypeMap,
  getPromoTypeById,
} from './definitions/index.js';
export { ADMIN_PROMOCODES_TABLE } from './constants.js';

import {
  normalizeCode,
  normalizeStatus,
  sortPromocodes,
  composePromocode,
  seedRecords,
  ensureSeededRecords,
} from './core/index.js';

export const __internals = Object.freeze({
  normalizeCode,
  normalizeStatus,
  composePromocode,
  seedRecords,
  ensureSeededRecords,
  sortPromocodes,
});
