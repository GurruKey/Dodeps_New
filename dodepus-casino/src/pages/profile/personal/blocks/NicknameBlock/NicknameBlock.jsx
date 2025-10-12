import { useEffect, useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { useAuth } from '../../../../../app/providers';

export default function NicknameBlock() {
  const { user, setNickname } = useAuth();

  const initial = user?.nickname ?? user?.email ?? '';
  const [value, setValue] = useState(initial);

  useEffect(() => setValue(user?.nickname ?? user?.email ?? ''), [user?.nickname, user?.email]);

  const changed = value !== (user?.nickname ?? user?.email ?? '');

  // dirty-индикатор
  useEffect(() => {
    const id = 'block:nickname';
    window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: !!changed } }));
    return () => window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: false } }));
  }, [changed]);

  // Save
  useEffect(() => {
    const onSave = () => {
      if (!changed) return;
      setNickname((value || '').trim());
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [changed, value, setNickname]);

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-2">Никнейм</Card.Title>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Form.Control
            type="text" placeholder="Введите никнейм" value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Form.Text className="text-muted">
            По умолчанию — E-mail; если вход по номеру телефона, поле может быть пустым.
          </Form.Text>
        </Form>
      </Card.Body>
    </Card>
  );
}
