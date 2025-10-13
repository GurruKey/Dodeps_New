import { Col, Form, Row } from 'react-bootstrap';

export default function AdvancedLimitsSection({ limitsForm, onFieldChange }) {
  return (
    <section>
      <h5 className="mb-3">Дополнительные ограничения</h5>
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="limits-min-deposit">
            <Form.Label>Минимальный депозит</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={limitsForm.minDeposit}
              onChange={onFieldChange('minDeposit')}
              placeholder="Нет"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="limits-max-deposit">
            <Form.Label>Максимальный депозит</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={limitsForm.maxDeposit}
              onChange={onFieldChange('maxDeposit')}
              placeholder="Нет"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="g-3 mt-0">
        <Col md={6}>
          <Form.Group controlId="limits-min-balance">
            <Form.Label>Минимальный баланс</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={limitsForm.minBalance}
              onChange={onFieldChange('minBalance')}
              placeholder="Нет"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="limits-max-balance">
            <Form.Label>Максимальный баланс</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={limitsForm.maxBalance}
              onChange={onFieldChange('maxBalance')}
              placeholder="Нет"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="g-3 mt-0">
        <Col md={6}>
          <Form.Group controlId="limits-max-usage">
            <Form.Label>Повторов на игрока</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={limitsForm.maxUsagePerClient}
              onChange={onFieldChange('maxUsagePerClient')}
              placeholder="Нет"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="limits-currency">
            <Form.Label>Валюта ограничений</Form.Label>
            <Form.Control
              value={limitsForm.currency}
              onChange={onFieldChange('currency')}
              placeholder="$"
            />
          </Form.Group>
        </Col>
      </Row>
      <Form.Group controlId="limits-allowed-currencies" className="mt-3">
        <Form.Label>Разрешённые валюты</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={limitsForm.allowedCurrencies}
          onChange={onFieldChange('allowedCurrencies')}
          placeholder="Например: USD\nEUR"
        />
      </Form.Group>
    </section>
  );
}
