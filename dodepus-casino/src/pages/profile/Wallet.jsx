import BalanceSummaryBlock from './blocks/Wallet/BalanceSummaryBlock.jsx';
import RealBalanceBlock from './blocks/Wallet/RealBalanceBlock.jsx';
import WithdrawableBlock from './blocks/Wallet/WithdrawableBlock.jsx';

export default function Wallet() {
  return (
    <div className="d-flex flex-column gap-3">
      <BalanceSummaryBlock />
      <RealBalanceBlock />
      <WithdrawableBlock />
    </div>
  );
}
