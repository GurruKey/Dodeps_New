import { Card, ListGroup } from 'react-bootstrap';
import VerificationFieldBadges from '../components/VerificationFieldBadges.jsx';
import { formatDateTime, getUserDisplayName } from '../utils.js';

export default function VerificationRejectedBlock({ requests = [], loading = false }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title as="h3" className="mb-1">
          Отказано
        </Card.Title>
        <Card.Text className="text-muted mb-0">
          Заявки, которые не прошли проверку. Пользователю потребуется повторно отправить данные.
        </Card.Text>
      </Card.Body>

      {requests.length === 0 ? (
        <Card.Body className="border-top text-secondary small">
          {loading ? 'Загрузка…' : 'Отказов нет.'}
        </Card.Body>
      ) : (
        <ListGroup variant="flush">
          {requests.map((request) => (
            <ListGroup.Item key={request.id} className="py-3">
              <div className="d-flex flex-column flex-xl-row gap-3 align-items-xl-start justify-content-between">
                <div className="flex-grow-1">
                  <div className="fw-semibold">{getUserDisplayName(request)}</div>
                  <div className="text-muted small">{request.userId}</div>
                  <div className="mt-3">
                    <VerificationFieldBadges fields={request.completedFields} />
                  </div>
                </div>
                <div className="text-xl-center" style={{ minWidth: 200 }}>
                  <div className="text-muted small">Дата решения</div>
                  <div className="fw-medium">{formatDateTime(request.reviewedAt)}</div>
                </div>
                {request?.reviewer?.name && (
                  <div className="text-xl-end" style={{ minWidth: 200 }}>
                    <div className="text-muted small">Проверил</div>
                    <div className="fw-medium">{request.reviewer.name}</div>
                    {request.reviewer.role && (
                      <div className="text-muted small">{request.reviewer.role}</div>
                    )}
                  </div>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  );
}
