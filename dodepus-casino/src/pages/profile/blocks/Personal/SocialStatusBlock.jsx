import { useEffect, useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

const options = [
  { value: 'employed',   label: 'Трудоустроен(а)' },
  { value: 'retired',    label: 'Пенсионер(ка)' },
  { value: 'student',    label: 'Студент(ка)' },
  { value: 'unemployed', label: 'Безработный(ая)' },
];

export default function SocialStatusBlock() {
  const { user, updateProfile } = useAuth();
  const [value, setValue] = useState(user?.socialStatus ?? 'employed');

  useEffect(() => {
    setValue(user?.socialStatus ?? 'employed');
  }, [user?.socialStatus]);

  const changed = value !== (user?.socialStatus ?? 'employed');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!changed) return;
    updateProfile({ socialStatus: value });
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Социальный статус</Card.Title>
        <Form onSubmit={onSubmit}>
          <Form.Label>Социальный статус</Form.Label>
          <Form.Select value={value} onChange={(e) => setValue(e.target.value)}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Form.Select>
          <div className="mt-3">
            <Button type="submit" variant="warning" disabled={!changed}>
              Сохранить
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
