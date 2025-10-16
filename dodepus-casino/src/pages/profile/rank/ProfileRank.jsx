import { ProfileBlocksLayout } from '../layout/blocks';
import { RankProgressBlock, RankRewardsBlock, RankSummaryBlock } from './blocks';
import { useProfileRankData } from './hooks';

const defaultSummary = Object.freeze({
  totalDeposits: 0,
  progressPercent: 0,
  currentLevel: {
    level: 0,
    label: 'VIP 0',
    shortLabel: 'VIP 0',
    tagline: 'Начните путь к бонусам: пополняйте счёт и открывайте VIP уровни.',
    description: '',
    purpose: '',
  },
  nextLevel: null,
  currency: 'USD',
});

export default function ProfileRank() {
  const { summary, levels, rewards } = useProfileRankData();
  const safeSummary = summary ?? defaultSummary;

  return (
    <ProfileBlocksLayout>
      <RankSummaryBlock summary={safeSummary} />
      <RankProgressBlock summary={safeSummary} levels={levels ?? []} />
      <RankRewardsBlock
        rewards={rewards ?? []}
        currentLevel={safeSummary.currentLevel}
        nextLevel={safeSummary.nextLevel}
      />
    </ProfileBlocksLayout>
  );
}
