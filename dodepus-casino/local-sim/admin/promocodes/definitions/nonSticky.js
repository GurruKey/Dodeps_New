const nonSticky = {
  id: 'non-sticky',
  name: 'Non-sticky («парашют»)',
  shortName: 'Non-sticky',
  description: 'Сначала тратятся реальные средства, бонус включается только когда остаток по реальным деньгам = 0.',
  howItWorks: 'Сначала тратится реал; бонус «включается» только когда реала нет.',
  formula:
    'При ставках: пока (баланс_реал > 0) — без вейджера; при переходе в бонус — вейджер (w · B).',
  plainText: 'Можно вывести ранние выигрыши с реала, не трогая бонус.',
  seed: {
    code: 'PARACHUTE',
    title: 'Non-sticky 50%',
    reward: '+50% до 500$',
    limit: 350,
    used: 178,
    status: 'active',
    wager: 25,
    cashoutCap: 12,
    params: {
      percent: 50,
      maxBonus: 500,
    },
    notes: 'Бонус активируется только после траты депозита.',
  },
};

export default nonSticky;
