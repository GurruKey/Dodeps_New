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

/**
 * Баланс казино — не для вывода и не учитывается в "Доступно к выводу".
 */
export default function CasinoBalanceBlock() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const casinoBalance = Number(user?.casinoBalance || 0);

  return (
    <Card>
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <Card.Title className="mb-1">Баланс казино</Card.Title>
          <div className="text-secondary small">Не для вывода. Не учитывается в доступном к выводу.</div>
        </div>
        <Badge bg="secondary" className="fs-6">
          {fmtCurrency(casinoBalance, currency)}
        </Badge>
      </Card.Body>
    </Card>
  );
}
