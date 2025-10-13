import { Col, Form, Row } from 'react-bootstrap';

export default function DisplaySection({ displayForm, onFieldChange, onToggle }) {
  return (
    <section>
      <h5 className="mb-3">Отображение и каналы</h5>
      <div className="d-flex flex-wrap gap-3">
        <Form.Check
          type="switch"
          id="display-highlight"
          label="Подсветить промо"
          checked={displayForm.highlight}
          onChange={onToggle('highlight')}
        />
        <Form.Check
          type="switch"
          id="display-main"
          label="Показать на главной"
          checked={displayForm.showOnMain}
          onChange={onToggle('showOnMain')}
        />
        <Form.Check
          type="switch"
          id="display-store"
          label="Показывать в магазине"
          checked={displayForm.showInStore}
          onChange={onToggle('showInStore')}
        />
      </div>
      <Row className="g-3 mt-0">
        <Col md={6}>
          <Form.Group controlId="display-color">
            <Form.Label>Цвет подсветки</Form.Label>
            <Form.Control
              type="text"
              value={displayForm.highlightColor}
              onChange={onFieldChange('highlightColor')}
              placeholder="#146C94"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="display-badge">
            <Form.Label>Текст бейджа</Form.Label>
            <Form.Control
              value={displayForm.badgeText}
              onChange={onFieldChange('badgeText')}
              placeholder="Например: Top"
            />
          </Form.Group>
        </Col>
      </Row>
      <Form.Group controlId="display-description" className="mt-3">
        <Form.Label>Описание для карточки</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={displayForm.description}
          onChange={onFieldChange('description')}
          placeholder="Короткое описание для блока промо"
        />
      </Form.Group>
      <Form.Group controlId="display-channels" className="mt-3">
        <Form.Label>Каналы размещения</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={displayForm.channels}
          onChange={onFieldChange('channels')}
          placeholder="Например: email\npush"
        />
        <Form.Text className="text-muted">По одному каналу на строку или через запятую.</Form.Text>
      </Form.Group>
    </section>
  );
}
