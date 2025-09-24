import { useEffect, useState } from 'react';
import { Card, Form, Button, Alert, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';

export default function Login() {
  const { isAuthed, login } = useAuth();
  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(''); // для дизайна, пока не используется
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthed) {
      navigate('/lobby', { replace: true });
    }
  }, [isAuthed, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const identifier = mode === 'email' ? email.trim().toLowerCase() : phone.trim();
    if (!identifier) {
      setError(mode === 'email' ? 'Введите E-mail' : 'Введите телефон');
      return;
    }

    // пароль пока не используется намеренно
    login(identifier);

    const next = location.state?.from?.pathname || '/lobby';
    navigate(next, { replace: true });
  };

  const fillDemo = () => {
    if (mode === 'email') setEmail('player@dodepus.dev');
    else setPhone('+380501234567');
  };

  return (
    <div className="d-flex justify-content-center">
      <Card className="w-100" style={{ maxWidth: 420 }}>
        <Card.Body>
          <Card.Title className="mb-3">Войти в Dodepus</Card.Title>

          {/* Переключатель способа входа */}
          <ButtonGroup className="mb-3 w-100">
            <ToggleButton
              id="login-mode-email"
              type="radio"
              variant={mode === 'email' ? 'primary' : 'outline-primary'}
              name="login-mode"
              value="email"
              checked={mode === 'email'}
              onChange={() => setMode('email')}
            >
              E-mail
            </ToggleButton>
            <ToggleButton
              id="login-mode-phone"
              type="radio"
              variant={mode === 'phone' ? 'primary' : 'outline-primary'}
              name="login-mode"
              value="phone"
              checked={mode === 'phone'}
              onChange={() => setMode('phone')}
            >
              Телефон
            </ToggleButton>
          </ButtonGroup>

          <Card.Text className="text-muted">
            Мок-логин без БД. Поле пароля добавлено для дизайна и пока не проверяется.
          </Card.Text>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            {mode === 'email' ? (
              <Form.Group controlId="loginEmail" className="mb-3">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </Form.Group>
            ) : (
              <Form.Group controlId="loginPhone" className="mb-3">
                <Form.Label>Телефон</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="+380XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  autoFocus
                  required
                />
              </Form.Group>
            )}

            <Form.Group controlId="loginPassword" className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">Войти</Button>
              <Button type="button" variant="outline-secondary" onClick={fillDemo}>
                Заполнить демо
              </Button>
            </div>

            <div className="mt-3">
              <span>Нет аккаунта? </span>
              <Link to="/register">Регистрация</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
