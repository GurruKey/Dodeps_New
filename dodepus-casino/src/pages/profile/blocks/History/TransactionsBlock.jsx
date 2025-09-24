import { Card, Table, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

function fmtCurrency(v, curr) {
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: curr || 'USD' }).format(v);
  } catch {
    return `${v} ${curr || ''}`;
  }
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function statusBadge(status) {
  switch (status) {
    case 'success': return <Badge bg="success">Успешно</Badge>;
    case 'failed':  return <Badge bg="danger">Неуспешно</Badge>;
    case 'pending': return <Badge bg="warning" text="dark">В ожидании</Badge>;
    default:        return <Badge bg="secondary">{status}</Badge>;
  }
}

function typeLabel(type, method) {
  const t = type === 'withdraw' ? 'Вывод' : 'Депозит';
  const m =
    method === 'bank'   ? 'Банк'   :
    method === 'crypto' ? 'Крипто' :
    method === 'card'   ? 'Карта'  : 'Другое';
  return `${t} · ${m}`;
}

export default function TransactionsBlock() {
  const { user } = useAuth();
  const items = user?.transactions || [];

  const copy = async (id) => {
    try { await navigator.clipboard?.writeText(id); } catch {}
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">История транзакций</Card.Title>

        {items.length === 0 ? (
          <div className="text-muted">История пуста.</div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th style={{minWidth: 140}}>Сумма</th>
                  <th style={{minWidth: 160}}>Тип</th>
                  <th style={{minWidth: 180}}>Дата</th>
                  <th style={{minWidth: 140}}>ID</th>
                  <th style={{minWidth: 120}}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {items.map((tx) => (
                  <tr key={tx.id}>
                    <td className="fw-semibold">
                      {fmtCurrency(tx.amount, tx.currency)}
                    </td>
                    <td>{typeLabel(tx.type, tx.method)}</td>
                    <td className="text-muted">{fmtDate(tx.date)}</td>
                    <td>
                      <Button size="sm" variant="outline-secondary" onClick={() => copy(tx.id)}>
                        Копировать ID
                      </Button>
                    </td>
                    <td>{statusBadge(tx.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
