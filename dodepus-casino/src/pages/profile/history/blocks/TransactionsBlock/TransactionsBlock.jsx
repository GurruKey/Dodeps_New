import { Card, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../../../../../app/providers';

function fmtCurrency(v, curr) {
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: curr || 'USD' })
      .format(Number(v || 0));
  } catch {
    return `${Number(v || 0).toFixed(2)} ${curr || ''}`;
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

function typeLabel(type) {
  if (type === 'deposit') return 'Депозит';
  if (type === 'withdraw') return 'Вывод';
  return 'Операция';
}

function statusBadge(status) {
  const map = {
    success: { bg: 'success', text: 'Успешно' },
    pending: { bg: 'secondary', text: 'В обработке' },
    failed:  { bg: 'danger', text: 'Ошибка' },
  };
  return map[status] || map.success;
}

export default function TransactionsBlock() {
  const { user } = useAuth();
  const rows = Array.isArray(user?.transactions) ? [...user.transactions] : [];
  const currency = user?.currency || 'USD';

  // сортируем по дате (новые сверху)
  rows.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">История транзакций</Card.Title>

        {rows.length === 0 ? (
          <div className="text-secondary">Пока нет транзакций.</div>
        ) : (
          <Table responsive hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th style={{ width: 170 }}>Когда</th>
                <th style={{ width: 120 }}>Тип</th>
                <th style={{ width: 140 }}>Метод</th>
                <th style={{ width: 140 }} className="text-end">Сумма</th>
                <th style={{ width: 130 }}>Статус</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const isWithdraw = t.type === 'withdraw';
                const sign = isWithdraw ? -1 : 1;
                const badge = statusBadge(t.status);
                return (
                  <tr key={t.id}>
                    <td className="text-nowrap">{fmtDate(t.date)}</td>
                    <td>{typeLabel(t.type)}</td>
                    <td className="text-muted">{t.method || '—'}</td>
                    <td className={`text-end ${isWithdraw ? 'text-danger' : 'text-success'}`}>
                      {isWithdraw ? '−' : '+'}{fmtCurrency(Math.abs(Number(t.amount || 0)), currency)}
                    </td>
                    <td>
                      <Badge bg={badge.bg}>{badge.text}</Badge>
                    </td>
                    <td className="text-muted text-truncate" title={t.id} style={{ maxWidth: 220 }}>
                      <code>{t.id}</code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}
