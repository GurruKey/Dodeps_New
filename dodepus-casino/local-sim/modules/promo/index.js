export { notifyAdminPromocodesChanged, subscribeToAdminPromocodes } from './core/events.js';
export { listAdminPromocodes, listAdminArchivedPromocodes } from './api/listPromocodes.js';
export { createAdminPromocode } from './api/createPromocode.js';
export { getAdminPromocodeById } from './api/getPromocode.js';
export {
  pauseAdminPromocode,
  resumeAdminPromocode,
  archiveAdminPromocode,
  extendAdminPromocodeEndsAt,
} from './api/updatePromocode.js';
export {
  promoTypeDefinitions,
  promoTypeMap,
  getPromoTypeById,
} from './definitions/index.js';

import { normalizeCode, normalizeStatus, sortPromocodes } from './core/helpers.js';
import { composePromocode, seedRecords, ensureSeededRecords } from './core/repository.js';

export const __internals = Object.freeze({
  normalizeCode,
  normalizeStatus,
  composePromocode,
  seedRecords,
  ensureSeededRecords,
  sortPromocodes,
});
