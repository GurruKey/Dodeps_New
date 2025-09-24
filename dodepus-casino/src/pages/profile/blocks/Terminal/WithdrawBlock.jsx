import { useState } from 'react';
import { Card, Form, Button, Stack, Badge } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

export default function WithdrawBlock() {
  const { user, addBalance } = useAuth();
  const currency = user?.currency || 'USD';
  const fmt = (v) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(v);

  const available = user?.balance ?? 0; // пока все средства доступны
  const [amount, setAmount] = useState('100');
  const presets = [100, 250, 500];

  const parsed = Number(amount);
  const valid = !Number.isNaN(parsed) && parsed > 0 && parsed <= available;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    // ограничим списание доступной суммой
    const delta = -Math.min(parsed, available);
    addBalance(delta);
    setAmount('');
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
          <span>Вывод средств</span>
          <Badge bg="secondary">Доступно: {fmt(available)}</Badge>
        </Card.Title>

        <Form onSubmit={submit}>
          <Form.Label className="mt-2">Сумма вывода</Form.Label>
          <Form.Control
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Введите сумму"
            isInvalid={Boolean(amount) && Number(amount) > available}
          />
          <Form.Control.Feedback type="invalid">
            Недостаточно средств.
          </Form.Control.Feedback>

          <Stack direction="horizontal" gap={2} className="flex-wrap mt-2">
            {presets.map((v) => (
              <Button
                key={v}
                size="sm"
                variant="outline-secondary"
                onClick={() => setAmount(String(v))}
              >
                {v}
              </Button>
            ))}
            {available > 0 && (
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => setAmount(String(available))}
              >
                Всё
              </Button>
            )}
          </Stack>

          <div className="mt-3 d-flex gap-2">
            <Button type="submit" variant="outline-light" disabled={!valid}>
              Вывести
            </Button>
            <Button type="button" variant="outline-secondary" onClick={() => setAmount('')}>
              Очистить
            </Button>
          </div>
        </Form>

        <div className="text-muted mt-3" style={{ fontSize: 12 }}>
          * Здесь позже появится выбор способа вывода и реквизиты.
        </div>
      </Card.Body>
    </Card>
  );
}
