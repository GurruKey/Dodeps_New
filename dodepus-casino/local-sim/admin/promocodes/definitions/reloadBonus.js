const reloadBonus = {
  id: 'reload-bonus',
  name: 'Релоад (повторный депозит)',
  shortName: 'Reload',
  description: 'Бонус для последующих депозитов, как правило с меньшим процентом и мягким лимитом.',
  howItWorks: 'Аналог Welcome, но для следующих депозитов, часто меньший %. ',
  formula:
    '**Бонус:** (B = min(p · D, B_max)). **Вейджер:** оборот (= w · B). **Кешаут-кэп:** (= k · B).',
  plainText: 'Регулярные «подкормки» при пополнениях.',
};

export default reloadBonus;
