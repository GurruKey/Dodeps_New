import { Card, Badge } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';

function fmtCurrency(v, curr) {
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: curr || 'USD' })
      .format(Number(v || 0));
  } catch {
    return `${Number(v || 0).toFixed(2)} ${curr || ''}`;
  }
}

export default function WithdrawableBlock() {
  const { user } = useAuth();

  const currency = user?.currency || 'USD';
  const balance = Number(user?.balance || 0);

  // DEMO-логика: к выводу доступен весь баланс.
  // Позже можно учесть: верификацию, активные бонусы/вейджер, холды и т.д.
  const withdrawable = balance;

  return (
    <Card>
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <Card.Title className="mb-1">Доступно к выводу</Card.Title>
          <div className="text-secondary small">В демо: равно текущему балансу</div>
        </div>
        <Badge bg="secondary" className="fs-6">
          {fmtCurrency(withdrawable, currency)}
        </Badge>
      </Card.Body>
    </Card>
  );
}
