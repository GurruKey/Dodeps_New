const depositFreeSpins = {
  id: 'deposit-free-spins',
  name: 'Фриспины депозитные',
  shortName: 'Deposit FS',
  description: 'Бесплатные вращения, выдаваемые после депозита, выигрыши с которых нужно отыграть.',
  howItWorks: 'FS выдаются после депозита.',
  formula:
    '**Выигрыш из FS:** (W). **Вейджер:** (w_fs · W). **Кеп:** (= k · (FS · c)).',
  plainText: 'Крутишь бесплатные спины, выигрыш нужно отыграть, вывод ограничен.',
  seed: {
    code: 'SPINSTORM50',
    title: '50 депозитных фриспинов',
    reward: '50 FS по 0.2$',
    limit: 800,
    used: 375,
    status: 'scheduled',
    wager: 25,
    cashoutCap: 6,
    params: {
      freeSpins: 50,
      spinValue: 0.2,
    },
    notes: 'Выдаётся на слот Storm Riders при депозите от 20$.',
  },
};

export default depositFreeSpins;
