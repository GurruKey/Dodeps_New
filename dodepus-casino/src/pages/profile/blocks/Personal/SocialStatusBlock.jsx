import { useEffect, useState } from 'react';
import { Card, Form } from 'react-bootstrap';
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

  useEffect(() => setValue(user?.socialStatus ?? 'employed'), [user?.socialStatus]);

  const changed = value !== (user?.socialStatus ?? 'employed');

  // dirty-индикатор
  useEffect(() => {
    const id = 'block:social';
    window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: !!changed } }));
    return () => window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: false } }));
  }, [changed]);

  // Save
  useEffect(() => {
    const onSave = () => {
      if (!changed) return;
      updateProfile({ socialStatus: value });
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [changed, value, updateProfile]);

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Социальный статус</Card.Title>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Form.Label>Социальный статус</Form.Label>
          <Form.Select value={value} onChange={(e) => setValue(e.target.value)}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Form.Select>
        </Form>
      </Card.Body>
    </Card>
  );
}
