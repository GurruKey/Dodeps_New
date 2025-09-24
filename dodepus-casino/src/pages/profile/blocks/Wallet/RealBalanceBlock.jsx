import { Card } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

export default function RealBalanceBlock() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const fmt = (v) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(v);
  const real = user?.balance ?? 0; // сейчас реальный = общий

  return (
    <Card>
      <Card.Body>
        <div className="text-muted">Реальный баланс</div>
        <div className="fs-5 fw-semibold">{fmt(real)}</div>
      </Card.Body>
    </Card>
  );
}
