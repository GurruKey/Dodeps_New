import { Form } from 'react-bootstrap';

export default function NotesSection({ value, onChange }) {
  return (
    <section>
      <Form.Group controlId="promo-notes">
        <Form.Label>Примечание</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={value}
          onChange={onChange('notes')}
          placeholder="Особые условия, ограничения, требования"
        />
      </Form.Group>
    </section>
  );
}
