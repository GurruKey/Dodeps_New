const wagerFree = {
  id: 'wager-free',
  name: 'Wager-free (без вейджера)',
  shortName: 'Wager-Free',
  description: 'Выигрыш с бонуса сразу переводится в реальные средства, обычно с ограничением по сумме.',
  howItWorks: 'Деньги/выигрыш из FS без отыгрыша (редко, обычно с кэпом).',
  formula: '**Реальные средства:** сразу, **Кеп:** (C_max).',
  plainText: 'Что выиграл — твоё, но чаще всего есть потолок.',
  seed: {
    code: 'WAGERFREE',
    title: 'Wager-Free 25 FS',
    reward: '25 фриспинов без отыгрыша',
    limit: 120,
    used: 67,
    status: 'paused',
    wager: 0,
    cashoutCap: 2,
    params: {
      freeSpins: 25,
      maxCashout: 50,
    },
    notes: 'Максимальный вывод 50$, без требований к обороту.',
  },
};

export default wagerFree;
