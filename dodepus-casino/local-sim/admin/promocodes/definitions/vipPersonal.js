const vipPersonal = {
  id: 'vip-personal',
  name: 'VIP/Персональный',
  shortName: 'VIP',
  description: 'Индивидуальные условия: повышенный процент, дополнительные фриспины или сниженный вейджер.',
  howItWorks: 'Как welcome или кэшбэк, но параметры кастомные.',
  formula: 'Как (1–6), но параметры кастомные: (p, w, k, B_max).',
  plainText: 'Тем, кого ценят: выше проценты и мягче условия.',
  seed: {
    code: 'VIPPOWER',
    title: 'VIP Boost 75%',
    reward: '+75% и 75 FS',
    limit: 50,
    used: 31,
    status: 'active',
    wager: 20,
    cashoutCap: 12,
    params: {
      percent: 75,
      maxBonus: 1000,
      freeSpins: 75,
    },
    notes: 'Раздаётся по приглашению персонального менеджера.',
  },
};

export default vipPersonal;
