import { Card } from 'react-bootstrap';

export default function ModeratorsChat() {
  return (
    <Card>
      <Card.Body>
        <Card.Title as="h3" className="mb-1">
          Чат модераторов
        </Card.Title>
        <Card.Text className="text-muted mb-0">
          Раздел находится в разработке.
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
