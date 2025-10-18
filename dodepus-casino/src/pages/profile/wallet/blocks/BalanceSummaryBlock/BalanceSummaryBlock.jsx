import { Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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

export default function BalanceSummaryBlock() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const balance = Number(user?.balance || 0);
  const currency = user?.currency || 'USD';

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex flex-column">
            <Card.Title className="mb-1">Баланс</Card.Title>

            <Button
              variant="link"
              className="p-0 text-decoration-none"
              onClick={() => navigate('/profile/history')}
            >
              История транзакций
            </Button>
          </div>

          {/* Значение баланса справа в бэйдже */}
          <Badge bg="secondary" className="fs-6">
            {fmtCurrency(balance, currency)}
          </Badge>
        </div>

        {/* CTA в терминал */}
        <div className="mt-3">
          <Button variant="primary" onClick={() => navigate('/profile/terminal')}>
            Терминал
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
