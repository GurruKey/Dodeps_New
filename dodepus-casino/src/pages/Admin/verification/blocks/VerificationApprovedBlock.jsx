import { Card, ListGroup, Button } from 'react-bootstrap';
import VerificationFieldBadges from '../components/VerificationFieldBadges.jsx';
import { formatDateTime, getProgressLabel, getUserDisplayName } from '../utils.js';

export default function VerificationApprovedBlock({ requests = [], loading = false, onView }) {
  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
          <div>
            <Card.Title as="h3" className="mb-1">
              Верифицировано
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Запросы, полностью прошедшие проверку. Данные пользователя подтверждены.
            </Card.Text>
          </div>
          {onView && (
            <Button variant="primary" onClick={onView} disabled={loading}>
              Просмотр
            </Button>
          )}
        </div>
      </Card.Body>

      {requests.length === 0 ? (
        <Card.Body className="border-top text-secondary small">
          {loading ? 'Загрузка…' : 'Пока нет завершённых заявок.'}
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
                <div className="text-xl-center" style={{ minWidth: 140 }}>
                  <div className="fw-medium">{getProgressLabel(request)}</div>
                  <div className="text-muted small">Подтверждено</div>
                </div>
                <div className="text-xl-end" style={{ minWidth: 200 }}>
                  <div className="text-muted small">Дата подтверждения</div>
                  <div className="fw-medium">{formatDateTime(request.reviewedAt)}</div>
                  {request?.reviewer?.name && (
                    <div className="text-muted small">{request.reviewer.name}</div>
                  )}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  );
}
