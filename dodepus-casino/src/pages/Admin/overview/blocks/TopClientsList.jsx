import { Card, ListGroup, Placeholder } from 'react-bootstrap';

export default function TopClientsList({ clients, isLoading }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Топ-5 по балансу</Card.Title>
        {isLoading ? (
          <div className="d-flex flex-column gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Placeholder key={index} as="div" animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            ))}
          </div>
        ) : clients.length ? (
          <ListGroup variant="flush">
            {clients.map((client) => (
              <ListGroup.Item key={client.id} className="d-flex justify-content-between align-items-center">
                <span className="text-truncate" style={{ maxWidth: '70%' }}>
                  {client.email}
                </span>
                <span className="fw-semibold">
                  {new Intl.NumberFormat('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(client.totalBalance)}
                </span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-muted">Нет данных для отображения.</div>
        )}
      </Card.Body>
    </Card>
  );
}
