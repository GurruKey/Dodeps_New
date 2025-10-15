import { Card, ListGroup } from 'react-bootstrap';

export default function RankRewardsList({ rewards }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Награды за ранги</Card.Title>
        <div className="text-muted mb-3">
          Получайте дополнительные бонусы и сервис, достигая новых уровней VIP.
        </div>
        <ListGroup variant="flush">
          {rewards.map((reward) => (
            <ListGroup.Item key={reward.level} className="py-3">
              <div className="fw-semibold">{reward.title}</div>
              <div className="text-muted small">{reward.description}</div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
