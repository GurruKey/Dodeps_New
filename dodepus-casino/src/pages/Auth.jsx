import { useEffect, useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../app/AuthContext.jsx';

export default function Auth() {
  const { isAuthed, login } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // если уже авторизован — уводим в лобби
  useEffect(() => {
    if (isAuthed) navigate('/lobby', { replace: true });
  }, [isAuthed, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Введите E-mail');
      return;
    }
    // простая мок-авторизация без пароля
    login(email.trim().toLowerCase());
    const next = location.state?.from?.pathname || '/lobby';
    navigate(next, { replace: true });
  };

  return (
    <div className="d-flex justify-content-center">
      <Card className="w-100" style={{ maxWidth: 420 }}>
        <Card.Body>
          <Card.Title className="mb-3">Войти в Dodepus</Card.Title>
          <Card.Text className="text-muted">
            Мок-логин без БД (email сохранится в браузере).
          </Card.Text>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="authEmail" className="mb-3">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">Войти</Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => setEmail('player@dodepus.dev')}
              >
                Заполнить демо
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
