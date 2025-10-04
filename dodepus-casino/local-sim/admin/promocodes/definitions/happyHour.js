const happyHour = {
  id: 'happy-hour',
  name: 'Happy-Hour/Бустер-код',
  shortName: 'Happy Hour',
  description: 'На ограниченное время улучшает условия: повышает процент бонуса, количество FS или множитель очков.',
  howItWorks: 'На время меняет условия: больше %/FS, x2 очков прогресса и т.п.',
  formula: 'Временная замена параметров: (p↑), (FS↑), (w↓) или множитель очков.',
  plainText: '«Час суперсилы»: всё щедрее и быстрее, но только в окно.',
  seed: {
    code: 'HAPPYHOUR',
    title: 'Happy Hour x2',
    reward: 'x2 очков и +30% к депозиту',
    limit: 600,
    used: 260,
    status: 'scheduled',
    wager: 20,
    cashoutCap: 9,
    params: {
      percent: 30,
      pointMultiplier: 2,
      windowHours: 2,
    },
    notes: 'Активен ежедневно с 19:00 до 21:00 по МСК.',
  },
};

export default happyHour;
