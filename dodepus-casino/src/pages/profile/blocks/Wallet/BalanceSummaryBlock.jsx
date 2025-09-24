import { Card, Button, Stack, Badge } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function BalanceSummaryBlock() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currency = user?.currency || 'USD';
  const fmt = (v) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(v);
  const total = user?.balance ?? 0;

  const go = (hash) => {
    // открываем терминал; hash — #withdraw или #deposit (необязательно)
    navigate(`/profile/terminal${hash ? `#${hash}` : ''}`);
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
          <div>
            <div className="text-muted">Общий баланс</div>
            <div className="balance-amount">{fmt(total)}</div>
          </div>

          <Stack direction="horizontal" gap={2} className="balance-actions">
            <Button variant="outline-light" onClick={() => go('withdraw')}>
              ВЫВОД СРЕДСТВ
            </Button>
            <Button variant="success" onClick={() => go('deposit')}>
              ДЕПОЗИТ
            </Button>
          </Stack>
        </div>
      </Card.Body>
    </Card>
  );
}
