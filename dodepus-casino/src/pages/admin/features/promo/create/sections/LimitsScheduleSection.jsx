import { Col, Form, Row } from 'react-bootstrap';

export default function LimitsScheduleSection({ formValues, onFieldChange }) {
  return (
    <section>
      <h5 className="mb-3">Ограничения и сроки</h5>
      <Row className="g-3">
        <Col md={4}>
          <Form.Group controlId="promo-limit">
            <Form.Label>Лимит активаций</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formValues.limit}
              onChange={onFieldChange('limit')}
              placeholder="Без лимита"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="promo-wager">
            <Form.Label>Вейджер</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formValues.wager}
              onChange={onFieldChange('wager')}
              placeholder="Например: 35"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="promo-cashout-cap">
            <Form.Label>Кеп на вывод (×)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formValues.cashoutCap}
              onChange={onFieldChange('cashoutCap')}
              placeholder="Например: 10"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-3 mt-0">
        <Col md={6}>
          <Form.Group controlId="promo-starts-at">
            <Form.Label>Начало действия</Form.Label>
            <Form.Control
              type="datetime-local"
              value={formValues.startsAt}
              onChange={onFieldChange('startsAt')}
              placeholder="Сразу после создания"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="promo-ends-at">
            <Form.Label>Окончание действия</Form.Label>
            <Form.Control
              type="datetime-local"
              value={formValues.endsAt}
              onChange={onFieldChange('endsAt')}
              placeholder="Не ограничено"
            />
          </Form.Group>
        </Col>
      </Row>
    </section>
  );
}
