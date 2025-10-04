import cashback from './cashback';
import depositFreeSpins from './depositFreeSpins';
import depositWelcome from './depositWelcome';
import eventCode from './eventCode';
import happyHour from './happyHour';
import mystery from './mystery';
import noDepositFreeSpins from './noDepositFreeSpins';
import noDepositMoney from './noDepositMoney';
import nonSticky from './nonSticky';
import promoStore from './promoStore';
import referral from './referral';
import reloadBonus from './reloadBonus';
import riskFree from './riskFree';
import sticky from './sticky';
import vipPersonal from './vipPersonal';
import wagerFree from './wagerFree';

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
