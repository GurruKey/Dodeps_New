export { ADMIN_PROMOCODES_TABLE } from '../shared/index.js';

export const ADMIN_PROMOCODES_STORAGE_KEY = 'dodepus.admin.promocodes';

export const ADMIN_PROMOCODES_EVENT = 'dodepus:admin-promocodes-change';

export const ADMIN_PROMOCODE_STATUS_LABELS = Object.freeze({
  active: 'Активен',
  scheduled: 'Запланирован',
  paused: 'Пауза',
  expired: 'Истёк',
  draft: 'Черновик',
  archived: 'Архив',
});

export const DEFAULT_PROMOCODE_WAGER = 30;
export const DEFAULT_PROMOCODE_CASHOUT_CAP = 10;
