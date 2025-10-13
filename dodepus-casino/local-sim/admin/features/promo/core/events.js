import { ADMIN_PROMOCODES_EVENT } from '../constants.js';
import { getEventTarget } from './helpers.js';

export const emitPromocodesChanged = (detail) => {
  const target = getEventTarget();
  if (!target?.dispatchEvent || typeof CustomEvent !== 'function') return;

  try {
    target.dispatchEvent(new CustomEvent(ADMIN_PROMOCODES_EVENT, { detail: detail ?? null }));
  } catch (error) {
    console.warn('Failed to emit admin promocodes change event', error);
  }
};

export const notifyAdminPromocodesChanged = (detail) => emitPromocodesChanged(detail);

export const subscribeToAdminPromocodes = (callback) => {
  const target = getEventTarget();
  if (!target?.addEventListener || typeof callback !== 'function') {
    return () => {};
  }

  const handler = (event) => {
    try {
      callback(event?.detail ?? null);
    } catch (error) {
      console.warn('Failed to handle admin promocodes subscription callback', error);
    }
  };

  target.addEventListener(ADMIN_PROMOCODES_EVENT, handler);
  return () => {
    target.removeEventListener(ADMIN_PROMOCODES_EVENT, handler);
  };
};
