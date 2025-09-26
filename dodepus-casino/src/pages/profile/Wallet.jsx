import BalanceSummaryBlock from './blocks/Wallet/BalanceSummaryBlock.jsx';
import RealBalanceBlock from './blocks/Wallet/RealBalanceBlock.jsx';
import WithdrawableBlock from './blocks/Wallet/WithdrawableBlock.jsx';
import CasinoBalanceBlock from './blocks/Wallet/CasinoBalanceBlock.jsx';

export default function Wallet() {
  return (
    <div className="d-grid gap-3">
      {/* Сводка + переходы */}
      <BalanceSummaryBlock />

      {/* Реальный баланс и доступно к выводу */}
      <div className="row g-3">
        <div className="col-md-6">
          <RealBalanceBlock />
        </div>
        <div className="col-md-6">
          <WithdrawableBlock />
        </div>
      </div>

      {/* Отдельный баланс казино (не для вывода, не учитывается) */}
      <CasinoBalanceBlock />
    </div>
  );
}
