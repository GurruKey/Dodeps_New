import { formatMoney, parseListInput } from './format.js';

export const composeLimitsParams = (limitsForm) => {
  if (!limitsForm) return null;

  const toNullableNumber = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return numeric;
  };

  const toNullablePositiveInt = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) return null;
    return Math.floor(numeric);
  };

  const limits = {};

  const minDeposit = toNullableNumber(limitsForm.minDeposit);
  if (minDeposit != null) {
    limits.minDeposit = minDeposit;
  }

  const maxDeposit = toNullableNumber(limitsForm.maxDeposit);
  if (maxDeposit != null) {
    limits.maxDeposit = maxDeposit;
  }

  const minBalance = toNullableNumber(limitsForm.minBalance);
  if (minBalance != null) {
    limits.minBalance = minBalance;
  }

  const maxBalance = toNullableNumber(limitsForm.maxBalance);
  if (maxBalance != null) {
    limits.maxBalance = maxBalance;
  }

  const maxUsagePerClient = toNullablePositiveInt(limitsForm.maxUsagePerClient);
  if (maxUsagePerClient != null) {
    limits.maxUsagePerClient = maxUsagePerClient;
  }

  const allowedCurrencies = parseListInput(limitsForm.allowedCurrencies);
  if (allowedCurrencies.length) {
    limits.allowedCurrencies = allowedCurrencies;
  }

  if (limitsForm.currency && typeof limitsForm.currency === 'string') {
    const currency = limitsForm.currency.trim();
    if (currency) {
      limits.currency = currency;
    }
  }

  return Object.keys(limits).length ? limits : null;
};

export const buildLimitsPreview = (limitsForm, rewardForm) => {
  const limits = composeLimitsParams(limitsForm);
  if (!limits) return '';

  const currency = limits.currency || rewardForm?.currency || '$';
  const parts = [];

  if (limits.minDeposit != null || limits.maxDeposit != null) {
    if (limits.minDeposit != null && limits.maxDeposit != null) {
      parts.push(
        `Депозит: ${formatMoney(limits.minDeposit, currency)} — ${formatMoney(limits.maxDeposit, currency)}`,
      );
    } else if (limits.minDeposit != null) {
      parts.push(`Минимальный депозит: ${formatMoney(limits.minDeposit, currency)}`);
    } else if (limits.maxDeposit != null) {
      parts.push(`Максимальный депозит: ${formatMoney(limits.maxDeposit, currency)}`);
    }
  }

  if (limits.minBalance != null || limits.maxBalance != null) {
    if (limits.minBalance != null && limits.maxBalance != null) {
      parts.push(
        `Баланс: ${formatMoney(limits.minBalance, currency)} — ${formatMoney(limits.maxBalance, currency)}`,
      );
    } else if (limits.minBalance != null) {
      parts.push(`Минимальный баланс: ${formatMoney(limits.minBalance, currency)}`);
    } else if (limits.maxBalance != null) {
      parts.push(`Максимальный баланс: ${formatMoney(limits.maxBalance, currency)}`);
    }
  }

  if (limits.maxUsagePerClient != null) {
    parts.push(`Повторов на игрока: ${limits.maxUsagePerClient}`);
  }

  if (limits.allowedCurrencies?.length) {
    parts.push(`Валюта: ${limits.allowedCurrencies.join(', ')}`);
  }

  return parts.join(' • ');
};
