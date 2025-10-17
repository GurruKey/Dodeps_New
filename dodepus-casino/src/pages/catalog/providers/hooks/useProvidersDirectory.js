import { useMemo } from 'react';
import { games } from '@/data/games.js';

export function useProvidersDirectory() {
  return useMemo(() => {
    const providersMap = new Map();

    games.forEach((game) => {
      const { providerSlug, provider, id, title } = game;
      if (!providersMap.has(providerSlug)) {
        providersMap.set(providerSlug, {
          slug: providerSlug,
          name: provider ?? providerSlug,
          total: 0,
          samples: [],
        });
      }

      const entry = providersMap.get(providerSlug);
      entry.total += 1;
      if (entry.samples.length < 3) {
        entry.samples.push({ id, title });
      }
    });

    return Array.from(providersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);
}
