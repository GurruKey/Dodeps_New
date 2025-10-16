import { ProfileBlocksLayout } from '../layout/blocks';
import { RankProgressBlock, RankRewardsBlock } from './blocks';
import { useProfileRankData } from './hooks/useProfileRankData.js';

const defaultSummary = Object.freeze({
  totalDeposits: 0,
  progressPercent: 0,
  currentLevel: { level: 0, label: 'VIP 0' },
  nextLevel: null,
  currency: 'USD',
});

export default function ProfileRank() {
  const { summary, levels, rewards } = useProfileRankData();

  return (
    <ProfileBlocksLayout>
      <RankProgressBlock summary={summary ?? defaultSummary} levels={levels ?? []} />
      <RankRewardsBlock rewards={rewards ?? []} />
    </ProfileBlocksLayout>
  );
}
