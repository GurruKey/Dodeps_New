import { Col, Form, Row } from 'react-bootstrap';

export default function AudienceSection({ audienceForm, onFieldChange, onToggle }) {
  return (
    <section>
      <h5 className="mb-3">Аудитория</h5>
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="audience-segments">
            <Form.Label>Сегменты</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={audienceForm.segments}
              onChange={onFieldChange('segments')}
              placeholder="Например: vip\nretention"
            />
            <Form.Text className="text-muted">По одному значению на строку или через запятую.</Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="audience-countries">
            <Form.Label>Страны</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={audienceForm.countries}
              onChange={onFieldChange('countries')}
              placeholder="Например: UA\nPL"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="g-3 mt-0">
        <Col md={6}>
          <Form.Group controlId="audience-levels">
            <Form.Label>Уровни/VIP-статусы</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={audienceForm.levels}
              onChange={onFieldChange('levels')}
              placeholder="Например: bronze\nsilver"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="audience-tags">
            <Form.Label>Теги/метки</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={audienceForm.tags}
              onChange={onFieldChange('tags')}
              placeholder="Например: streamer"
            />
          </Form.Group>
        </Col>
      </Row>
      <div className="d-flex gap-3 mt-2">
        <Form.Check
          type="switch"
          id="audience-vip-only"
          label="Только для VIP"
          checked={audienceForm.vipOnly}
          onChange={onToggle('vipOnly')}
        />
        <Form.Check
          type="switch"
          id="audience-new-only"
          label="Только новые игроки"
          checked={audienceForm.newPlayersOnly}
          onChange={onToggle('newPlayersOnly')}
        />
      </div>
    </section>
  );
}
