const sticky = {
  id: 'sticky',
  name: 'Sticky («клейкий»)',
  shortName: 'Sticky',
  description: 'Бонус остаётся на счёте до полного отыгрыша, вывод реальных средств невозможен пока не выполнен вейджер.',
  howItWorks: 'Бонус «прилипает»: вывод до отыгрыша недоступен.',
  formula: 'Как (1), но при выводе B сгорает/заперт до (w · B).',
  plainText: 'Пока не отыграешь — не вывести. Жёстче non-sticky.',
  seed: {
    code: 'GLUEBONUS',
    title: 'Sticky 120%',
    reward: '120% до 600$',
    limit: 420,
    used: 198,
    status: 'active',
    wager: 40,
    cashoutCap: 15,
    params: {
      percent: 120,
      maxBonus: 600,
    },
    notes: 'При запросе на вывод бонус сгорает, если вейджер не выполнен.',
  },
};

export default sticky;
