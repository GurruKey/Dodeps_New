const depositWelcome = {
  id: 'deposit-welcome',
  name: 'Депозитный (Welcome)',
  shortName: 'Welcome',
  description: 'Начисляет процент к первому депозиту, иногда добавляет бесплатные спины.',
  howItWorks: 'Начисляет % к первому депозиту, иногда + FS.',
  formula:
    '**Бонус:** (B = min(p · D, B_max)). **Вейджер:** оборот (= w · B). **Кешаут-кэп:** (= k · B).',
  plainText: 'Пополнил — получил деньги или спины и должен выполнить х-кратный оборот.',
  seed: {
    code: 'WELCOME100',
    title: 'Приветственный бонус 100%',
    reward: '100% + 100 фриспинов',
    limit: 1000,
    used: 742,
    status: 'active',
    wager: 35,
    cashoutCap: 10,
    params: {
      percent: 100,
      maxBonus: 500,
      maxFreeSpins: 100,
    },
    notes: 'Стартовый пакет для новых игроков.',
  },
};

export default depositWelcome;
