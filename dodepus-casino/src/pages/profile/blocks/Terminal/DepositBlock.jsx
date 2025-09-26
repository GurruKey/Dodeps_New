import { useState } from 'react';
import { Card, Form, Button, Stack, Badge } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

export default function DepositBlock() {
  const { user, addBalance, addTransaction } = useAuth();
  const currency = user?.currency || 'USD';
  const fmt = (v) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(v);

  const [amount, setAmount] = useState('100');
  const presets = [100, 250, 500, 1000];

  const parsed = Number(amount);
  const valid = !Number.isNaN(parsed) && parsed > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;

    // 1) Пополняем баланс
    addBalance(parsed);

    // 2) Пишем транзакцию в историю
    addTransaction({
      amount: parsed,
      type: 'deposit',      // для истории: депозит
      method: 'other',      // заглушка метода (позже: card/crypto/bank)
      status: 'success',    // демо: сразу успешно
      // date/currency/id заполнятся в addTransaction автоматически
    });

    // Очистим поле
    setAmount('');
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
          <span>Депозит</span>
          <Badge bg="secondary">{fmt(user?.balance ?? 0)}</Badge>
        </Card.Title>

        <Form onSubmit={submit}>
          <Form.Label className="mt-2">Сумма пополнения</Form.Label>
          <Form.Control
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Введите сумму"
          />

          <Stack direction="horizontal" gap={2} className="flex-wrap mt-2">
            {presets.map((v) => (
              <Button
                key={v}
                size="sm"
                variant="outline-secondary"
                onClick={() => setAmount(String(v))}
              >
                +{v}
              </Button>
            ))}
          </Stack>

          <div className="mt-3 d-flex gap-2">
            <Button type="submit" variant="success" disabled={!valid}>
              Пополнить
            </Button>
            <Button type="button" variant="outline-secondary" onClick={() => setAmount('')}>
              Очистить
            </Button>
          </div>
        </Form>

        <div className="text-muted mt-3" style={{ fontSize: 12 }}>
          * Позже здесь появится выбор платёжного метода (карта, крипто и т.д.).
        </div>
      </Card.Body>
    </Card>
  );
}
