import { Badge, Card, ListGroup } from 'react-bootstrap';

const getStatusLabel = (statusOptions, value) => {
  const match = statusOptions.find((option) => option.value === value);
  return match?.label ?? value;
};

export default function SummaryCard({ items, statusOptions }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title as="h5" className="mb-3">
          Сводка промокода
        </Card.Title>
        {items.length ? (
          <ListGroup variant="flush">
            {items.map((item) => (
              <ListGroup.Item key={item.title} className="px-0">
                <div className="text-muted small mb-1">{item.title}</div>
                <div className="fw-semibold">
                  {item.kind === 'status' ? (
                    <Badge bg="secondary" className="text-uppercase fw-semibold">
                      {getStatusLabel(statusOptions, item.value)}
                    </Badge>
                  ) : (
                    item.value
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Card.Text className="text-muted mb-0">
            Заполните параметры, и мы сформируем сводку автоматически.
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
}
