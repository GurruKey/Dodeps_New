const cashback = {
  id: 'cashback',
  name: 'Кэшбэк-код',
  shortName: 'Cashback',
  description: 'Возвращает процент от чистого проигрыша за период. Может приходить живыми деньгами или бонусом.',
  howItWorks: 'Возврат % от чистого проигрыша за период.',
  formula:
    '**Проигрыш:** (L = max(0, ставки − выигрыши)). **Кэшбэк:** (CB = min(r · L, CB_max)). Если в бонусных — вейджер (w · CB).',
  plainText: 'Часть проигрыша вернут реальными средствами или бонусом.',
  seed: {
    code: 'CASHBACK25',
    title: '25% еженедельный кэшбэк',
    reward: 'Возврат до 25% проигрыша',
    limit: null,
    used: 518,
    status: 'active',
    wager: 10,
    cashoutCap: null,
    params: {
      rate: 0.25,
      maxReturn: 500,
    },
    notes: 'Начисляется по понедельникам, нужно активировать в течение 48 часов.',
  },
};

export default cashback;
