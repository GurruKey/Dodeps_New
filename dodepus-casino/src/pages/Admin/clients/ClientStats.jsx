import { Row, Col } from 'react-bootstrap';

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({ label, value }) {
  return (
    <div className="p-3 border rounded bg-light h-100">
      <div className="text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div className="fw-semibold fs-5 mt-2">{value}</div>
    </div>
  );
}

export default function ClientStats({ totalClients, filteredClients, totalBalance, filteredBalance }) {
  return (
    <Row className="g-3">
      <Col xs={12} md={6} xl={3}>
        <StatCard label="Всего клиентов" value={totalClients} />
      </Col>
      <Col xs={12} md={6} xl={3}>
        <StatCard label="В подборке" value={filteredClients} />
      </Col>
      <Col xs={12} md={6} xl={3}>
        <StatCard label="Общий баланс" value={formatCurrency(totalBalance)} />
      </Col>
      <Col xs={12} md={6} xl={3}>
        <StatCard label="Баланс подборки" value={formatCurrency(filteredBalance)} />
      </Col>
    </Row>
  );
}
