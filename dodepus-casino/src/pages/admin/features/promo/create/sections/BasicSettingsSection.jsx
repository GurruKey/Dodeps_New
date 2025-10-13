import { Col, Form, Row } from 'react-bootstrap';

export default function BasicSettingsSection({
  formValues,
  statusOptions,
  promoTypes,
  selectedType,
  onTypeSelect,
  onFieldChange,
}) {
  return (
    <section>
      <h4 className="h5 mb-3">Базовые параметры</h4>
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="promo-type">
            <Form.Label>Тип промокода</Form.Label>
            <Form.Select value={formValues.typeId} onChange={(event) => onTypeSelect(event.target.value)} required>
              <option value="">Выберите тип</option>
              {promoTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="promo-status">
            <Form.Label>Статус</Form.Label>
            <Form.Select value={formValues.status} onChange={onFieldChange('status')}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-3 mt-0">
        <Col md={4}>
          <Form.Group controlId="promo-code">
            <Form.Label>Код</Form.Label>
            <Form.Control
              type="text"
              value={formValues.code}
              onChange={onFieldChange('code')}
              placeholder={selectedType?.seed?.code ?? 'WELCOME100'}
              required
            />
          </Form.Group>
        </Col>
        <Col md={8}>
          <Form.Group controlId="promo-title">
            <Form.Label>Название/заголовок</Form.Label>
            <Form.Control
              type="text"
              value={formValues.title}
              onChange={onFieldChange('title')}
              placeholder={selectedType?.seed?.title ?? '100% на первый депозит'}
            />
          </Form.Group>
        </Col>
      </Row>
    </section>
  );
}
