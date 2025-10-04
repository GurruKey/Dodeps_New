export const STATUS_VARIANTS = {
  success: { label: 'Успешно', variant: 'success' },
  pending: { label: 'В ожидании', variant: 'warning' },
  failed: { label: 'Ошибка', variant: 'danger' },
};

export const TYPE_VARIANTS = {
  deposit: { label: 'Пополнение', variant: 'success' },
  withdraw: { label: 'Вывод', variant: 'danger' },
  other: { label: 'Прочее', variant: 'secondary' },
};

export const METHOD_LABELS = {
  card: 'Карта',
  bank: 'Банковский перевод',
  crypto: 'Криптовалюта',
  other: 'Другое',
};
