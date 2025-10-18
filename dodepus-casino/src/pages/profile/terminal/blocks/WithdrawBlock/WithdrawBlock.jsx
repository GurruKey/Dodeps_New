import { Card, Button, Form } from 'react-bootstrap';
import { useAuth } from '@/app/providers';

export default function WithdrawBlock() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Вывод средств</Card.Title>
        <Form className="d-grid gap-3">
          <Form.Group>
            <Form.Label>Сумма вывода</Form.Label>
            <Form.Control type="number" min="1" step="0.01" placeholder={`0.00 ${currency}`} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Реквизиты</Form.Label>
            <Form.Control type="text" placeholder="Номер карты или кошелька" />
          </Form.Group>
          <Button variant="outline-primary">Вывести</Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
