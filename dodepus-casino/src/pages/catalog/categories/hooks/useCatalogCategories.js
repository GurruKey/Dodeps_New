import { useMemo } from 'react';
import { games, categories } from '@/data';

export function useCatalogCategories() {
  return useMemo(() => {
    return categories.map((categoryName) => {
      const relatedGames = games.filter((game) => game.category === categoryName);

      return {
        name: categoryName,
        games: relatedGames,
        total: relatedGames.length,
      };
    });
  }, []);
}
