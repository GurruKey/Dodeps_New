import { useMemo } from 'react';
import { games } from '@/data/games.js';

export function useProviderGames(providerSlug) {
  return useMemo(() => {
    if (!providerSlug) {
      return {
        games: [],
        providerName: '',
      };
    }

    const providerGames = games.filter((game) => game.providerSlug === providerSlug);
    const providerName = providerGames[0]?.provider ?? providerSlug;

    return {
      games: providerGames,
      providerName,
    };
  }, [providerSlug]);
}
