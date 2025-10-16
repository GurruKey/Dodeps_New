const riskFree = {
  id: 'risk-free',
  name: 'Риск-фри / Страховка сессии',
  shortName: 'Risk-Free',
  description: 'Возвращает часть убытка или неудачных спинов, часто в виде бонусных средств.',
  howItWorks: 'Вернут % от убытка/неудачных спинов.',
  formula: 'Похоже на кэшбэк: (RF = min(r · L, RF_max)) (+ возможный вейджер).',
  plainText: '«Не зашло — часть вернут».',
};

export default riskFree;
