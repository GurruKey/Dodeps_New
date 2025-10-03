import { Card, Table, Badge } from 'react-bootstrap';

const statusVariantMap = {
  active: 'success',
  scheduled: 'info',
  expired: 'secondary',
};

export default function PromoCodesTable({ promocodes }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Список промокодов</Card.Title>
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Код</th>
              <th style={{ width: '20%' }}>Название</th>
              <th style={{ width: '20%' }}>Вознаграждение</th>
              <th style={{ width: '15%' }}>Лимит</th>
              <th style={{ width: '15%' }}>Использовано</th>
              <th style={{ width: '15%' }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {promocodes.map((promo) => (
              <tr key={promo.code}>
                <td>{promo.code}</td>
                <td>{promo.title}</td>
                <td>{promo.reward}</td>
                <td>{promo.limit ?? '—'}</td>
                <td>{promo.used}</td>
                <td>
                  <Badge bg={statusVariantMap[promo.status] ?? 'secondary'}>{promo.statusLabel}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
