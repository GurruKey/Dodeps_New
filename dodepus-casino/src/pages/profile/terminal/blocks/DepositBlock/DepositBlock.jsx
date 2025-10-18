import { Card, Button, Form } from 'react-bootstrap';
import { useAuth } from '@/app/providers';

export default function DepositBlock() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Пополнение</Card.Title>
        <Form className="d-grid gap-3">
          <Form.Group>
            <Form.Label>Сумма пополнения</Form.Label>
            <Form.Control type="number" min="1" step="0.01" placeholder={`0.00 ${currency}`} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Источник</Form.Label>
            <Form.Select defaultValue="card">
              <option value="card">Банковская карта</option>
              <option value="wallet">Электронный кошелёк</option>
              <option value="crypto">Криптовалюта</option>
            </Form.Select>
          </Form.Group>
          <Button variant="success">Пополнить</Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
