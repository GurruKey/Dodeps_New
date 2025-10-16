import { Card } from 'react-bootstrap';

export default function SeasonOverviewBlock() {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Сезон</Card.Title>
        <div className="text-muted">
          Сезонные события и прогресс появятся позже. Следите за обновлениями!
        </div>
      </Card.Body>
    </Card>
  );
}
