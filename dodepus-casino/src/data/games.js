// Фикстуры. Каждая игра знает slug провайдера (для /game/:provider/:slug и структуры папок).

export const games = [
  {
    id: 'g1',
    slug: 'coinflip',
    title: 'Coin Flip',
    provider: 'Dodepus',
    providerSlug: 'dodepus',
    category: 'Популярные',
    rtp: 98.2,
    volatility: 'Low',
    description: 'Выбираешь сторону монеты и ставку. Моментальный результат.',
    image: '/placeholder/coinflip.jpg',
    tags: ['быстро', 'простые правила'],
  },
  {
    id: 'g2',
    slug: 'lucky777',
    title: 'Lucky 777',
    provider: 'LuckySoft',
    providerSlug: 'luckysoft',
    category: 'Слоты',
    rtp: 96.1,
    volatility: 'Medium',
    description: 'Классический слот с семёрками и фриспинами.',
    image: '/placeholder/slot777.jpg',
    tags: ['слот', 'классика'],
  },
  {
    id: 'g3',
    slug: 'european-roulette',
    title: 'European Roulette',
    provider: 'LivePro',
    providerSlug: 'livepro',
    category: 'Live',
    rtp: 97.3,
    volatility: 'High',
    description: 'Европейская рулетка (один ноль).',
    image: '/placeholder/roulette.jpg',
    tags: ['live', 'рулетка'],
  },
];

export const categories = ['Популярные', 'Слоты', 'Live', 'Новые'];
export const providers = ['Dodepus', 'LuckySoft', 'LivePro'];

// Удобная мапа «человекочитаемое → slug папки»
export const providerSlugMap = {
  Dodepus: 'dodepus',
  LuckySoft: 'luckysoft',
  LivePro: 'livepro',
};

// НОВЫЙ поиск по паре (provider/slug) — под маршрут /game/:provider/:slug
export function findGame(providerSlug, slug) {
  return games.find((g) => g.providerSlug === providerSlug && g.slug === slug);
}

// Старый помощник (на время совместимости со старым роутом /game/:slug)
export function findGameBySlug(slug) {
  return games.find((g) => g.slug === slug);
}

export function recommendByCategory(category, excludeId) {
  return games
    .filter((g) => g.category === category && g.id !== excludeId)
    .slice(0, 6);
}
