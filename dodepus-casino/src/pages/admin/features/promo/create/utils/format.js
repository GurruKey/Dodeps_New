export const formatNumberInput = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
};

export const formatDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const iso = date.toISOString();
  return iso.slice(0, 16);
};

export const toIsoOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

export const formatMoney = (value, currency) => {
  if (value === '' || value === null || value === undefined) return '';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return `${value} ${currency ?? ''}`.trim();
  }
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numeric);
  return `${formatted} ${currency ?? ''}`.trim();
};

export const parseListInput = (value) => {
  if (typeof value !== 'string') return [];
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const formatListForInput = (value) => {
  if (!value) return '';
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
    ? value.split(/[\n,;]+/)
    : [];
  return list
    .map((item) => String(item).trim())
    .filter(Boolean)
    .join('\n');
};
