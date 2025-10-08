import { Col, Row } from 'react-bootstrap';

import { formatCurrency } from '../utils.js';

export default function TransactionsSummary({ totals = [] }) {
  if (!totals.length) {
    return null;
  }

  return (
    <Row className="g-3">
      {totals.map((item) => (
        <Col key={item.currency} xs={12} md={6} xl={4}>
          <div className="border rounded-3 p-3 h-100 bg-light-subtle">
            <div className="text-uppercase text-muted fw-semibold small">{item.currency}</div>
            <div className="d-flex flex-column gap-2 mt-2">
              <div>
                <div className="text-muted small">Пополнения</div>
                <div className="fw-semibold">{formatCurrency(item.depositTotal, item.currency)}</div>
                <div className="text-muted small">{item.depositCount || 0} операций</div>
              </div>
              <div>
                <div className="text-muted small">Выводы</div>
                <div className="fw-semibold">{formatCurrency(item.withdrawTotal, item.currency)}</div>
                <div className="text-muted small">{item.withdrawCount || 0} операций</div>
              </div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );
}
