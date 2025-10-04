const riskFree = {
  id: 'risk-free',
  name: 'Риск-фри / Страховка сессии',
  shortName: 'Risk-Free',
  description: 'Возвращает часть убытка или неудачных спинов, часто в виде бонусных средств.',
  howItWorks: 'Вернут % от убытка/неудачных спинов.',
  formula: 'Похоже на кэшбэк: (RF = min(r · L, RF_max)) (+ возможный вейджер).',
  plainText: '«Не зашло — часть вернут».',
  seed: {
    code: 'RISKFREE10',
    title: '10% страховка сессии',
    reward: 'Возврат до 10% проигрыша',
    limit: 400,
    used: 109,
    status: 'scheduled',
    wager: 15,
    cashoutCap: 6,
    params: {
      rate: 0.1,
      maxReturn: 200,
    },
    notes: 'Доступен раз в неделю в понедельник, начисляется бонусом.',
  },
};

export default riskFree;
