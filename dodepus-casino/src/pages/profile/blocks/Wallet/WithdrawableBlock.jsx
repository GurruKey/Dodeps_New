import { Card } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

export default function WithdrawableBlock() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const fmt = (v) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(v);

  // пока без удержаний/вэйджера — доступно всё
  const withdrawable = user?.balance ?? 0;

  return (
    <Card>
      <Card.Body>
        <div className="text-muted">Доступно на вывод</div>
        <div className="fs-5 fw-semibold">{fmt(withdrawable)}</div>
      </Card.Body>
    </Card>
  );
}
