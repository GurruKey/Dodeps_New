import { Card, ListGroup, Button } from 'react-bootstrap';
import VerificationFieldBadges from '../components/VerificationFieldBadges.jsx';
import { formatDateTime, getUserDisplayName } from '../utils.js';

export default function VerificationRejectedBlock({
  requests = [],
  loading = false,
  onView,
  onOpen,
  isVisible = true,
}) {
  const totalRequests = Array.isArray(requests) ? requests.length : 0;

  const handleOpen = (request, intent = 'view') => {
    if (!onOpen) return;
    onOpen(request, intent);
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
          <div>
            <Card.Title as="h3" className="mb-1">
              <span className="d-inline-flex align-items-center gap-2">
                <span>Отказано</span>
                <span className="fw-semibold text-secondary">{totalRequests}</span>
              </span>
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Заявки, которые не прошли проверку. Пользователю потребуется повторно отправить данные.
            </Card.Text>
          </div>
          {onView && (
            <Button variant="primary" onClick={onView} disabled={loading}>
              Просмотр
            </Button>
          )}
        </div>
      </Card.Body>

      {!isVisible ? (
        <Card.Body className="border-top text-secondary small">
          Список скрыт. Нажмите «Просмотр», чтобы загрузить заявки.
        </Card.Body>
      ) : totalRequests === 0 ? (
        <Card.Body className="border-top text-secondary small">
          {loading ? 'Загрузка…' : 'Отказов нет.'}
        </Card.Body>
      ) : (
        <ListGroup variant="flush">
          {requests.map((request) => (
            <ListGroup.Item
              key={request.id}
              className="py-3"
              action={Boolean(onOpen)}
              onClick={() => handleOpen(request, 'view')}
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
