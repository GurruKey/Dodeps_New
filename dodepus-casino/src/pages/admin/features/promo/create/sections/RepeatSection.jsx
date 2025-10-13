import { Col, Form, Row } from 'react-bootstrap';

export default function RepeatSection({ formValues, onFieldChange }) {
  return (
    <section>
      <h5 className="mb-3">Повторные активации</h5>
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="promo-repeat-limit">
            <Form.Label>Количество повторов на игрока</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formValues.repeatLimit}
              onChange={onFieldChange('repeatLimit')}
              placeholder="Без ограничений"
            />
            <Form.Text className="text-muted">
              Оставьте пустым, чтобы разрешить бесконечное количество повторных активаций.
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="promo-repeat-delay">
            <Form.Label>Задержка между активациями (ч)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.5"
              value={formValues.repeatDelayHours}
              onChange={onFieldChange('repeatDelayHours')}
              placeholder="Например: 24"
            />
            <Form.Text className="text-muted">
              Задайте минимальное время между активациями. 24 часа — раз в день.
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>
    </section>
  );
}
