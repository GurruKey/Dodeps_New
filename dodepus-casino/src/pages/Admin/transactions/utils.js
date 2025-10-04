import { METHOD_LABELS } from './constants.js';

export const normalizeMethodValue = (method) => {
  const normalized = typeof method === 'string' ? method.trim().toLowerCase() : '';
  return normalized || 'other';
};

export const formatCurrency = (value, currency) => {
  const amount = Number.isFinite(Number(value)) ? Math.abs(Number(value)) : 0;
  const normalizedCurrency = typeof currency === 'string' && currency.trim() ? currency.trim() : 'USD';

  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: normalizedCurrency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${normalizedCurrency}`.trim();
  }
};

export const formatAmount = (transaction) => {
  const sign = transaction.type === 'withdraw' ? '-' : '+';
  return `${sign}${formatCurrency(transaction.amount, transaction.currency)}`;
};

export const formatDateTime = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMethod = (method) => {
  const normalized = normalizeMethodValue(method);
  if (!normalized) {
    return '—';
  }

  if (METHOD_LABELS[normalized]) {
    return METHOD_LABELS[normalized];
  }

  return typeof method === 'string' && method.trim() ? method.trim() : '—';
};
