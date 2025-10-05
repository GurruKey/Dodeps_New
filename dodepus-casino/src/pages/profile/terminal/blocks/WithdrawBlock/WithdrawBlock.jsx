import { useState } from 'react';
import { Card, Form, Button, Stack, Badge } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';

export default function WithdrawBlock() {
  const { user, addBalance, addTransaction } = useAuth();
  const balance = Number(user?.balance || 0);
  const currency = user?.currency || 'USD';
  const fmt = (v) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(Number(v || 0));

  const [amount, setAmount] = useState('100');
  const presets = [50, 100, 250, 500];

  const parsed = Number(amount);
  const validNumber = !Number.isNaN(parsed) && parsed > 0;
  const enough = parsed <= balance;
  const canSubmit = validNumber && enough;

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // 1) Списываем с баланса
    addBalance(-parsed);

    // 2) Фиксируем транзакцию в истории
    addTransaction({
      amount: parsed,
      type: 'withdraw',   // тип: вывод
      method: 'other',    // заглушка метода
      status: 'success',  // демо: сразу успешно
      // date/currency/id заполнятся в addTransaction автоматически
    });

    setAmount('');
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
          <span>Вывод</span>
          <Badge bg="secondary">{fmt(balance)}</Badge>
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
            isInvalid={validNumber && !enough}
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
          </Stack>

          <div className="mt-3 d-flex gap-2">
            <Button type="submit" variant="warning" disabled={!canSubmit}>
              Вывести
            </Button>
            <Button type="button" variant="outline-secondary" onClick={() => setAmount('')}>
              Очистить
            </Button>
          </div>
        </Form>

        <div className="text-muted mt-3" style={{ fontSize: 12 }}>
          * В демо проверяем только наличие средств на балансе. Ограничения «к выводу» можно
          подключить позже (например, по верификации).
        </div>
      </Card.Body>
    </Card>
  );
}
