import { balanceLabelMap } from '../constants.js';
import { formatMoney } from './format.js';

export const buildRewardPreview = (rewardForm) => {
  if (!rewardForm) return '';

  const parts = [];
  const currency = rewardForm.currency || '$';
  const balanceLabel = balanceLabelMap[rewardForm.balanceType] ?? 'баланс';

  if (rewardForm.depositEnabled && rewardForm.depositPercent) {
    let depositPart = `${rewardForm.depositPercent}%`;
    if (rewardForm.depositMaxAmount) {
      depositPart += ` до ${formatMoney(rewardForm.depositMaxAmount, currency)}`;
    }
    depositPart += ` на ${balanceLabel}`;
    parts.push(depositPart);
  }

  if (rewardForm.cashEnabled && rewardForm.cashAmount) {
    parts.push(`${formatMoney(rewardForm.cashAmount, currency)} на ${balanceLabel}`);
  }

  if (rewardForm.freeSpinsEnabled && rewardForm.freeSpins) {
    let spinsPart = `${rewardForm.freeSpins} FS`;
    if (rewardForm.freeSpinsValue) {
      spinsPart += ` по ${formatMoney(rewardForm.freeSpinsValue, currency)}`;
    }
    if (rewardForm.freeSpinsGame) {
      spinsPart += ` в ${rewardForm.freeSpinsGame}`;
    }
    parts.push(spinsPart);
  }

  if (rewardForm.customTextEnabled && rewardForm.customText) {
    parts.push(rewardForm.customText);
  }

  return parts.join(' + ');
};

export const normalizeRewardParams = (rewardForm) => {
  if (!rewardForm || typeof rewardForm !== 'object') return {};

  const toNullableNumber = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return numeric;
  };

  const normalized = {};

  if (rewardForm.depositEnabled) {
    const depositPercent = toNullableNumber(rewardForm.depositPercent);
    if (depositPercent != null) {
      normalized.depositPercent = depositPercent;
    }

    const depositMaxAmount = toNullableNumber(rewardForm.depositMaxAmount);
    if (depositMaxAmount != null) {
      normalized.depositMaxAmount = depositMaxAmount;
    }
  }

  if (rewardForm.cashEnabled) {
    const cashAmount = toNullableNumber(rewardForm.cashAmount);
    if (cashAmount != null) {
      normalized.cashAmount = cashAmount;
    }
  }

  if (rewardForm.freeSpinsEnabled) {
    const freeSpins = toNullableNumber(rewardForm.freeSpins);
    if (freeSpins != null) {
      normalized.freeSpins = freeSpins;
    }

    const freeSpinsValue = toNullableNumber(rewardForm.freeSpinsValue);
    if (freeSpinsValue != null) {
      normalized.freeSpinsValue = freeSpinsValue;
    }

    const freeSpinsGame =
      typeof rewardForm.freeSpinsGame === 'string' && rewardForm.freeSpinsGame.trim()
        ? rewardForm.freeSpinsGame.trim()
        : null;
    if (freeSpinsGame) {
      normalized.freeSpinsGame = freeSpinsGame;
    }
  }

  if (rewardForm.customTextEnabled) {
    const customText =
      typeof rewardForm.customText === 'string' && rewardForm.customText.trim()
        ? rewardForm.customText.trim()
        : null;
    if (customText) {
      normalized.customText = customText;
    }
  }

  const currency = rewardForm.currency || '$';
  if (currency) {
    normalized.currency = currency;
  }

  const balanceType = rewardForm.balanceType || 'main';
  if (balanceType) {
    normalized.balanceType = balanceType;
  }

  const preview = buildRewardPreview(rewardForm);
  if (preview) {
    normalized.preview = preview;
  }

  return normalized;
};
