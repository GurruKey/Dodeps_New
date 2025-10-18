import { ProfileBlocksLayout } from '@/pages/profile/layout/blocks';
import {
  BalanceSummaryBlock,
  BalancesRowBlock,
  CasinoBalanceBlock,
} from '../blocks';

export default function ProfileWalletPage() {
  return (
    <ProfileBlocksLayout>
      <BalanceSummaryBlock />
      <BalancesRowBlock />
      <CasinoBalanceBlock />
    </ProfileBlocksLayout>
  );
}
