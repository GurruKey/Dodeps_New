import { useState } from 'react';
import { Card, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { useAuth } from '../app/AuthContext.jsx';

export default function Profile() {
  const { user, addBalance, setBalance, logout } = useAuth();
  if (!user) return null; // роут защищён, но на всякий случай

  const [amount, setAmount] = useState('10');
  const currency = user.currency || 'USD';
  const fmt = (v) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(v);

  const parsed = Number(amount);
  const isValid = !Number.isNaN(parsed) && parsed > 0;

  const quick = [10, 50, 100, 250];

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-2">Профиль</Card.Title>
        <p className="text-muted mb-1">{user.email}</p>
        <p className="mb-3">
          Баланс: <Badge bg="secondary">{fmt(user.balance || 0)}</Badge>
        </p>

        <Row className="g-2 align-items-end">
          <Col xs={8} md={6}>
            <Form.Label>Сумма</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Col>
          <Col xs="auto">
            <Button
              disabled={!isValid}
              onClick={() => addBalance(parsed)}
              variant="success"
            >
              Пополнить
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              disabled={!isValid || (user.balance ?? 0) <= 0}
              onClick={() => addBalance(-parsed)}
              variant="outline-danger"
            >
              Снять
            </Button>
          </Col>
        </Row>

        <div className="d-flex gap-2 mt-3">
          {quick.map((v) => (
            <Button
              key={v}
              size="sm"
              variant="outline-secondary"
              onClick={() => setAmount(String(v))}
            >
              +{v}
            </Button>
          ))}
          <Button size="sm" variant="outline-secondary" onClick={() => setBalance(0)}>
            Обнулить
          </Button>
        </div>

        <hr />
        <div className="d-flex gap-2">
          <Button variant="outline-dark" onClick={logout}>
            Выйти из аккаунта
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
