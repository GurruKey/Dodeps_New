const referral = {
  id: 'referral',
  name: 'Реферальный',
  shortName: 'Referral',
  description: 'Награждает пригласившего и друга за регистрацию и депозит по ссылке.',
  howItWorks: 'Бонус за приглашение друга (и/или другу).',
  formula:
    'Часто: **Пригласивший:** (R = min(r · D_friend, R_max)). **Друг:** Welcome по (1).',
  plainText: 'Делишься кодом — оба получаете награды.',
  seed: {
    code: 'REFERWIN',
    title: 'Реферальный бонус 20$',
    reward: '20$ обоим после депозита',
    limit: null,
    used: 640,
    status: 'active',
    wager: 20,
    cashoutCap: 5,
    params: {
      inviterReward: 20,
      friendReward: 20,
    },
    notes: 'Необходимо чтобы приглашённый внёс минимум 25$.',
  },
};

export default referral;
