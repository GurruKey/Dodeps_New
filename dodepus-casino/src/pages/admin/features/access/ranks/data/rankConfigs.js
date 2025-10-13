export const availableRanks = [
  {
    id: 'user',
    group: 'player',
    tier: 0,
    name: 'Пользователь',
    description: 'Стандартный игрок казино без дополнительных привилегий.',
  },
  {
    id: 'vip-bronze',
    group: 'vip',
    tier: 1,
    name: 'VIP Bronze',
    description: 'Стартовый VIP-уровень с лёгкими бонусами и ускоренным выводом.',
  },
  {
    id: 'vip-silver',
    group: 'vip',
    tier: 2,
    name: 'VIP Silver',
    description: 'Больше кэшбэка, персональный менеджер и улучшенные лимиты.',
  },
  {
    id: 'vip-gold',
    group: 'vip',
    tier: 3,
    name: 'VIP Gold',
    description: 'Максимальные привилегии для топовых игроков и эксклюзивные подарки.',
  },
];

export const rankGroups = [
  { key: 'player', label: 'Базовые игроки' },
  { key: 'vip', label: 'VIP ранги' },
];

const RANK_BENEFIT_LABELS = Object.freeze({
  higherLimits: 'Повышенные лимиты',
  cashback: 'Еженедельный кэшбэк',
  vipSupport: 'VIP поддержка 24/7',
  personalManager: 'Персональный менеджер',
  birthdayGifts: 'Подарки на праздники',
  exclusiveTournaments: 'Эксклюзивные турниры',
});

const RANK_BENEFIT_KEYS = Object.keys(RANK_BENEFIT_LABELS);

const buildBenefits = (...keys) =>
  RANK_BENEFIT_KEYS.reduce((acc, key) => {
    acc[key] = keys.includes(key);
    return acc;
  }, {});

export const rankMatrixLegend = RANK_BENEFIT_LABELS;

export const rankBenefitMatrix = [
  {
    rankId: 'user',
    rankName: 'Пользователь',
    benefits: buildBenefits(),
  },
  {
    rankId: 'vip-bronze',
    rankName: 'VIP Bronze',
    benefits: buildBenefits('cashback', 'vipSupport'),
  },
  {
    rankId: 'vip-silver',
    rankName: 'VIP Silver',
    benefits: buildBenefits('cashback', 'vipSupport', 'higherLimits', 'personalManager'),
  },
  {
    rankId: 'vip-gold',
    rankName: 'VIP Gold',
    benefits: buildBenefits(
      'cashback',
      'vipSupport',
      'higherLimits',
      'personalManager',
      'birthdayGifts',
      'exclusiveTournaments'
    ),
  },
];

export const findRankById = (rankId) =>
  availableRanks.find((rank) => rank.id === rankId) ?? null;
