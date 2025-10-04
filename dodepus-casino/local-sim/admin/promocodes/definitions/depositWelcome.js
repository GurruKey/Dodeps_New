const depositWelcome = {
  id: 'deposit-welcome',
  name: 'Депозитный (Welcome)',
  shortName: 'Welcome',
  description: 'Начисляет процент к первому депозиту, иногда добавляет бесплатные спины.',
  howItWorks: 'Начисляет % к первому депозиту, иногда + FS.',
  formula:
    '**Бонус:** (B = min(p · D, B_max)). **Вейджер:** оборот (= w · B). **Кешаут-кэп:** (= k · B).',
  plainText: 'Пополнил — получил деньги или спины и должен выполнить х-кратный оборот.',
};

export default depositWelcome;
