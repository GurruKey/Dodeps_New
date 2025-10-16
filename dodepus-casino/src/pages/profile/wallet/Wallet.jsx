import { ProfileBlocksLayout } from '../layout/blocks';
import {
  BalanceSummaryBlock,
  BalancesRowBlock,
  CasinoBalanceBlock,
} from './blocks';

export default function Wallet() {
  return (
    <ProfileBlocksLayout>
      {/* Сводка + переходы */}
      <BalanceSummaryBlock />

      {/* Балансы в две колонки */}
      <BalancesRowBlock />

      {/* Отдельный баланс казино (не для вывода, не учитывается) */}
      <CasinoBalanceBlock />
    </ProfileBlocksLayout>
  );
}
