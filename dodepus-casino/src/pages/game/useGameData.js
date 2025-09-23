import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { findGame, findGameBySlug, recommendByCategory } from '../../data/games.js';

/**
 * Хук собирает всю логику для страницы игры:
 * - читает параметры роутера
 * - ищет игру (по новому /game/:provider/:slug или старому /game/:slug)
 * - готовит рекомендации
 * - отдаёт удобные поля (providerSlug/gameSlug)
 */
export default function useGameData() {
  const { provider, slug } = useParams();

  const game = useMemo(() => {
    if (provider && slug) return findGame(provider, slug);   // новый формат
    if (slug && !provider) return findGameBySlug(slug);      // совместимость
    return null;
  }, [provider, slug]);

  const recs = useMemo(
    () => (game ? recommendByCategory(game.category, game.id) : []),
    [game]
  );

  const providerSlug = provider || game?.providerSlug || null;
  const gameSlug = game?.slug || slug || null;

  return {
    game,
    recs,
    providerSlug,
    gameSlug,
    notFound: !game,
  };
}
