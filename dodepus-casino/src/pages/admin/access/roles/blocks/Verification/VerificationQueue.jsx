import { Badge, Card, ListGroup } from 'react-bootstrap';
import { verificationQueue } from '../../data/roleConfigs.js';

const statusLabels = {
  idle: { label: 'Ожидает', variant: 'secondary' },
  pending: { label: 'Проверяется', variant: 'warning' },
  approved: { label: 'Подтверждено', variant: 'success' },
};

export default function VerificationQueue() {
  return (
    <Card>
      <Card.Body>
        <Card.Title as="h4" className="mb-1">
          Верификация
        </Card.Title>
        <Card.Text className="text-muted">
          Очередь запросов на подтверждение личности. Назначьте проверяющего и обновите статусы.
        </Card.Text>
      </Card.Body>
      <ListGroup variant="flush">
        {verificationQueue.map((item) => {
          const status = statusLabels[item.status] ?? {
            label: item.status,
            variant: 'secondary',
          };
          return (
            <ListGroup.Item key={item.id} className="d-flex flex-column flex-md-row gap-2">
              <div className="flex-grow-1">
                <div className="fw-semibold">{item.id}</div>
                <div className="text-muted small">{item.documentType}</div>
              </div>
              <div className="text-md-center" style={{ minWidth: 140 }}>
                <div className="fw-medium">{item.userId}</div>
                <div className="text-muted small">{item.submittedAt}</div>
              </div>
              <div className="text-md-end">
                <Badge bg={status.variant}>{status.label}</Badge>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </Card>
  );
}
