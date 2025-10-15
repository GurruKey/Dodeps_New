import RankProgressBlock from './components/RankProgressBlock.jsx';
import RankRewardsList from './components/RankRewardsList.jsx';
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
    <>
      <RankProgressBlock summary={summary ?? defaultSummary} levels={levels ?? []} />
      <RankRewardsList rewards={rewards ?? []} />
    </>
  );
}
