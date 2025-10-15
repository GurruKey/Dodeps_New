import { Card, Table, ProgressBar, Badge } from 'react-bootstrap';

const formatAmount = (value, currency) => {
  const numeric = Number(value);
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;
  const safeCurrency = typeof currency === 'string' && currency ? currency : 'USD';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

export default function RankProgressBlock({ summary, levels }) {
  const currency = summary?.currency || 'USD';
  const progressPercent = Number.isFinite(summary?.progressPercent)
    ? summary.progressPercent
    : 0;
  const nextLevel = summary?.nextLevel ?? null;
  const currentLabel = summary?.currentLevel?.label ?? 'VIP 0';
  const badgeVariant = summary?.currentLevel?.level >= 5 ? 'warning' : 'secondary';

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
          <span>Ранг пополнения</span>
          <Badge bg={badgeVariant}>{currentLabel}</Badge>
        </Card.Title>

        <div className="text-muted mb-3">
          Сумма пополнений: {formatAmount(summary?.totalDeposits ?? 0, currency)}
        </div>

        <ProgressBar
          now={progressPercent}
          label={`${progressPercent}%`}
          aria-label="Прогресс до следующего ранга"
          className="mb-3"
        />

        {nextLevel ? (
          <div className="small text-muted mb-4">
            До {nextLevel.label} осталось {formatAmount(nextLevel.depositsRemaining ?? 0, currency)}.
          </div>
        ) : (
          <div className="small text-muted mb-4">Вы достигли максимального ранга VIP 10.</div>
        )}

        <Table striped bordered hover responsive size="sm" className="mb-0">
          <thead>
            <tr>
              <th className="text-center">Ранг</th>
              <th>Пополнение для уровня</th>
              <th>Сумма пополнений всего</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.level}>
                <td className="text-center fw-semibold">{level.label}</td>
                <td>{formatAmount(level.depositStep, currency)}</td>
                <td>{formatAmount(level.totalDeposit, currency)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
