import { useMemo } from 'react';
import { useAuth } from '@/app/providers';

export function useProfileRankSummary() {
  const { user } = useAuth();

  return useMemo(() => {
    const summary = user?.rankSummary;
    if (!summary || typeof summary !== 'object') {
      return null;
    }

    return {
      totalDeposits: Number(summary.totalDeposits ?? 0),
      progressPercent: Number(summary.progressPercent ?? 0),
      currentLevel: summary.currentLevel ?? null,
      nextLevel: summary.nextLevel ?? null,
      currency: summary.currency ?? user?.currency ?? 'USD',
    };
  }, [user]);
}
