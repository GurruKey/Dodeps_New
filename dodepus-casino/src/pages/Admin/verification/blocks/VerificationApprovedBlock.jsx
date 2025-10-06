import { Card, ListGroup } from 'react-bootstrap';
import VerificationFieldBadges from '../components/VerificationFieldBadges.jsx';
import { formatDateTime, getProgressLabel, getUserDisplayName } from '../utils.js';

export default function VerificationApprovedBlock({
  requests = [],
  loading = false,
  onOpen,
}) {
  const totalRequests = Array.isArray(requests) ? requests.length : 0;

  const handleOpen = (request) => {
    if (!onOpen) return;
    onOpen(request);
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
          <div>
            <Card.Title as="h3" className="mb-1">
              <span className="d-inline-flex align-items-center gap-2">
                <span>Верифицировано</span>
                <span className="fw-semibold text-success">{totalRequests}</span>
              </span>
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Запросы, полностью прошедшие проверку. Данные пользователя подтверждены.
            </Card.Text>
          </div>
        </div>
      </Card.Body>

      {totalRequests === 0 ? (
        <Card.Body className="border-top text-secondary small">
          {loading ? 'Загрузка…' : 'Пока нет завершённых заявок.'}
        </Card.Body>
      ) : (
        <ListGroup variant="flush">
          {requests.map((request) => (
            <ListGroup.Item
              key={request.id}
              className="py-3"
              action={Boolean(onOpen)}
              onClick={() => handleOpen(request)}
              style={onOpen ? { cursor: 'pointer' } : undefined}
            >
              <div className="d-flex flex-column flex-xl-row gap-3 align-items-xl-start justify-content-between">
                <div className="flex-grow-1">
                  <div className="fw-semibold">{getUserDisplayName(request)}</div>
                  <div className="text-muted small">{request.userId}</div>
                  <div className="mt-3">
                    <VerificationFieldBadges
                      fields={request.completedFields}
                      requested={request.requestedFields}
                      status={request.status}
                    />
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
