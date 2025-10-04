const reloadBonus = {
  id: 'reload-bonus',
  name: 'Релоад (повторный депозит)',
  shortName: 'Reload',
  description: 'Бонус для последующих депозитов, как правило с меньшим процентом и мягким лимитом.',
  howItWorks: 'Аналог Welcome, но для следующих депозитов, часто меньший %. ',
  formula:
    '**Бонус:** (B = min(p · D, B_max)). **Вейджер:** оборот (= w · B). **Кешаут-кэп:** (= k · B).',
  plainText: 'Регулярные «подкормки» при пополнениях.',
  seed: {
    code: 'RELOAD50',
    title: 'Еженедельный релоад',
    reward: '+50% к депозиту',
    limit: 500,
    used: 212,
    status: 'active',
    wager: 30,
    cashoutCap: 8,
    params: {
      percent: 50,
      maxBonus: 300,
    },
    notes: 'Доступен по пятницам для постоянных игроков.',
  },
};

export default reloadBonus;
