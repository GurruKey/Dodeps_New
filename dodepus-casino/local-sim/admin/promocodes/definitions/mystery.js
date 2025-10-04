const mystery = {
  id: 'mystery',
  name: 'Мистери-код',
  shortName: 'Mystery',
  description: 'Активирует случайную награду из заранее заданного пула.',
  howItWorks: 'Случайная награда из пула.',
  formula: 'prize ~ Random({B, FS, CB, ...}).',
  plainText: '«Лутбокс» формата промо. Что выпадет — сюрприз.',
  seed: {
    code: 'MYSTERYBOX',
    title: 'Mystery Drop',
    reward: 'Случайный бонус',
    limit: 900,
    used: 540,
    status: 'active',
    wager: 25,
    cashoutCap: 8,
    params: {
      pool: ['20 FS', '50% депозит', '10$ cash'],
    },
    notes: 'Награда определяется сразу после активации.',
  },
};

export default mystery;
