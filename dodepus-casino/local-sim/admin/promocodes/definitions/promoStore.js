const promoStore = {
  id: 'promo-store',
  name: 'Промо-очки/магазин',
  shortName: 'Promo Store',
  description: 'Код добавляет очки лояльности, которые можно обменять на награды.',
  howItWorks: 'Код даёт очки, обмен на награды.',
  formula: '**Очки:** (P = P + P_code). Обмен по внутренним курсам.',
  plainText: 'Сначала копишь, потом меняешь на FS/кэшбек/мерч.',
  seed: {
    code: 'POINTSHOP',
    title: 'Магазин лояльности +100',
    reward: '+100 промо-очков',
    limit: 2000,
    used: 1310,
    status: 'active',
    wager: null,
    cashoutCap: null,
    params: {
      points: 100,
    },
    notes: 'Очки можно обменять на бонусы в разделе «Магазин».',
  },
};

export default promoStore;
