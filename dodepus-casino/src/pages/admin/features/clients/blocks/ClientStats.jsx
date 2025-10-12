import { Placeholder, Row, Col } from 'react-bootstrap';
import { useTheme } from '../../../../../app/providers';

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({ label, value, isLoading, theme }) {
  const content = isLoading ? (
    <Placeholder as="span" animation="glow" className="d-inline-flex w-75">
      <Placeholder xs={8} />
    </Placeholder>
  ) : (
    value
  );

  const backgroundClass = theme === 'dark' ? 'bg-dark-subtle' : 'bg-body-tertiary';

  return (
    <div className={`p-3 border rounded h-100 border-body-tertiary ${backgroundClass}`}>
      <div className="text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div className="fw-semibold fs-5 mt-2 text-body">{content}</div>
    </div>
  );
}

export default function ClientStats({
  totalClients,
  filteredClients,
  totalBalance,
  filteredBalance,
  isLoading,
}) {
  const { theme } = useTheme();

  return (
    <Row className="g-3">
      <Col xs={12} md={6} xl={3}>
        <StatCard label="Всего клиентов" value={totalClients} isLoading={isLoading} theme={theme} />
      </Col>
      <Col xs={12} md={6} xl={3}>
        <StatCard label="В подборке" value={filteredClients} isLoading={isLoading} theme={theme} />
      </Col>
      <Col xs={12} md={6} xl={3}>
        <StatCard
          label="Общий баланс"
          value={formatCurrency(totalBalance)}
          isLoading={isLoading}
          theme={theme}
        />
      </Col>
      <Col xs={12} md={6} xl={3}>
        <StatCard
          label="Баланс подборки"
          value={formatCurrency(filteredBalance)}
          isLoading={isLoading}
          theme={theme}
        />
      </Col>
    </Row>
  );
}
