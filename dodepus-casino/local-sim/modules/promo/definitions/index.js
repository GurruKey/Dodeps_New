import cashback from './cashback.js';
import depositFreeSpins from './depositFreeSpins.js';
import depositWelcome from './depositWelcome.js';
import eventCode from './eventCode.js';
import happyHour from './happyHour.js';
import mystery from './mystery.js';
import noDepositFreeSpins from './noDepositFreeSpins.js';
import noDepositMoney from './noDepositMoney.js';
import nonSticky from './nonSticky.js';
import promoStore from './promoStore.js';
import referral from './referral.js';
import reloadBonus from './reloadBonus.js';
import riskFree from './riskFree.js';
import sticky from './sticky.js';
import vipPersonal from './vipPersonal.js';
import wagerFree from './wagerFree.js';

export const promoTypeDefinitions = [
  depositWelcome,
  reloadBonus,
  noDepositMoney,
  depositFreeSpins,
  noDepositFreeSpins,
  cashback,
  riskFree,
  eventCode,
  vipPersonal,
  referral,
  wagerFree,
  nonSticky,
  sticky,
  happyHour,
  mystery,
  promoStore,
];

export const promoTypeMap = promoTypeDefinitions.reduce((acc, type) => {
  if (!type?.id) {
    return acc;
  }

  const normalizedId = String(type.id).trim();
  if (!normalizedId) {
    return acc;
  }

  acc.set(normalizedId, type);
  return acc;
}, new Map());

export const getPromoTypeById = (typeId) => {
  if (typeof typeId !== 'string') return null;
  const normalized = typeId.trim();
  if (!normalized) return null;
  return promoTypeMap.get(normalized) ?? null;
};

export const __internals = Object.freeze({ promoTypeMap });
