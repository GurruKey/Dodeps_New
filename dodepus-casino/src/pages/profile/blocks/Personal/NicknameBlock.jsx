import { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

export default function NicknameBlock() {
  const { user, setNickname } = useAuth();
  const initial = user?.nickname ?? user?.email ?? '';
  const [value, setValue] = useState(initial);
  const changed = value !== (user?.nickname ?? user?.email ?? '');

  const save = () => {
    setNickname(value.trim());
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-2">Никнейм</Card.Title>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Введите никнейм"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button type="submit" variant="warning" disabled={!changed}>
              Сохранить
            </Button>
          </div>
          <Form.Text className="text-muted">
            По умолчанию — E-mail; если вход по номеру телефона, поле может быть пустым.
          </Form.Text>
        </Form>
      </Card.Body>
    </Card>
  );
}
