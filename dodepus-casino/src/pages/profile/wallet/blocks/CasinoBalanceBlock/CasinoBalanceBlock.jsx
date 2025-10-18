import { Card, Badge } from 'react-bootstrap';
import { useAuth } from '@/app/providers';

function fmtCurrency(v, curr) {
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: curr || 'USD' }).format(
      Number(v || 0),
    );
  } catch {
    return `${Number(v || 0).toFixed(2)} ${curr || ''}`;
  }
}

export default function CasinoBalanceBlock() {
  const { user } = useAuth();
  const balance = Number(user?.casinoBalance || 0);
  const currency = user?.currency || 'USD';

  return (
    <Card>
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <Card.Title className="mb-1">Баланс казино</Card.Title>
          <div className="text-secondary small">Используется только в играх, вывести нельзя</div>
        </div>
        <Badge bg="secondary" className="fs-6">
          {fmtCurrency(balance, currency)}
        </Badge>
      </Card.Body>
    </Card>
  );
}
