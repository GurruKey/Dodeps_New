import { Badge, Card, Spinner, Table } from 'react-bootstrap';

const statusVariantMap = {
  active: 'success',
  scheduled: 'info',
  paused: 'warning',
  expired: 'secondary',
  draft: 'dark',
};

const formatLimit = (limit) => {
  if (limit == null) return '—';
  return limit.toLocaleString('ru-RU');
};

const formatUsed = (used, limit) => {
  const value = used?.toLocaleString?.('ru-RU') ?? String(used ?? 0);
  if (limit == null) return value;
  return `${value} / ${limit.toLocaleString('ru-RU')}`;
};

const renderRequirements = (wager, cashoutCap) => {
  const parts = [];
  if (wager === 0) {
    parts.push('Без вейджера');
  } else if (typeof wager === 'number' && Number.isFinite(wager)) {
    parts.push(`Вейджер ×${wager}`);
  }

  if (typeof cashoutCap === 'number' && Number.isFinite(cashoutCap)) {
    parts.push(`Кеп ${cashoutCap}×`);
  }

  if (!parts.length) return null;
  return parts.join(' · ');
};

export default function PromoCodesTable({ promocodes, isLoading }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Список промокодов</Card.Title>
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>Код</th>
              <th style={{ width: '18%' }}>Тип</th>
              <th style={{ width: '20%' }}>Название</th>
              <th style={{ width: '20%' }}>Вознаграждение</th>
              <th style={{ width: '10%' }}>Лимит</th>
              <th style={{ width: '10%' }}>Использовано</th>
              <th style={{ width: '10%' }}>Статус</th>
            </tr>
          </thead>
          {isLoading ? (
            <tbody>
              <tr>
                <td colSpan={7} className="text-center py-4">
                  <Spinner animation="border" size="sm" role="status" className="me-2" />
                  Загрузка промокодов…
                </td>
              </tr>
            </tbody>
          ) : promocodes.length > 0 ? (
            <tbody>
              {promocodes.map((promo) => {
                const requirements = renderRequirements(promo.wager, promo.cashoutCap);
                return (
                  <tr key={promo.id ?? promo.code}>
                    <td className="fw-semibold">{promo.code}</td>
                    <td>{promo.type?.name ?? '—'}</td>
                    <td>{promo.title}</td>
                    <td>
                      <div>{promo.reward}</div>
                      {requirements && <div className="small text-muted">{requirements}</div>}
                    </td>
                    <td>{formatLimit(promo.limit)}</td>
                    <td>{formatUsed(promo.used, promo.limit)}</td>
                    <td>
                      <Badge bg={statusVariantMap[promo.status] ?? 'secondary'}>{
                        promo.statusLabel
                      }</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted">
                  Промокоды ещё не созданы. Добавьте первый через раздел «Создать промокод».
                </td>
              </tr>
            </tbody>
          )}
        </Table>
      </Card.Body>
    </Card>
  );
}
