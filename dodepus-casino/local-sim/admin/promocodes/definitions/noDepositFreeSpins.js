const noDepositFreeSpins = {
  id: 'no-deposit-free-spins',
  name: 'Фриспины бездепозитные',
  shortName: 'No-Dep FS',
  description: 'Бесплатные вращения без пополнения, как правило с повышенным вейджером и жёсткими лимитами.',
  howItWorks: 'FS без пополнения.',
  formula:
    '**Выигрыш из FS:** (W). **Вейджер:** (w_fs · W). **Кеп:** (= k · (FS · c)).',
  plainText: 'Бесплатные спины «за код», но с жёсткими условиями по отыгрышу и выводу.',
  seed: {
    code: 'FREESPINS30',
    title: '30 FS без депозита',
    reward: '30 FS по 0.1$',
    limit: 300,
    used: 221,
    status: 'paused',
    wager: 50,
    cashoutCap: 4,
    params: {
      freeSpins: 30,
      spinValue: 0.1,
    },
    notes: 'Требуется верификация e-mail, победы ограничены 40$.',
  },
};

export default noDepositFreeSpins;
