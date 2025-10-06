import { Card, Button, ListGroup } from 'react-bootstrap';
import VerificationFieldBadges from '../components/VerificationFieldBadges.jsx';
import { formatDateTime, getProgressLabel, getUserDisplayName } from '../utils.js';

export default function VerificationPartialBlock({
  requests = [],
  loading = false,
  onView,
  onOpen,
  busyId,
  isVisible = true,
}) {
  const isBusy = (requestId) => busyId === requestId;
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
                <span>Частичная верификация</span>
                <span className="fw-semibold text-secondary">{totalRequests}</span>
              </span>
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Заявки, в которых подтверждены не все поля. Проверьте обновлённые данные и завершите процесс.
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
          {loading ? 'Загрузка…' : 'Нет заявок на частичную проверку.'}
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
                <div className="text-xl-center" style={{ minWidth: 140 }}>
                  <div className="fw-medium">{getProgressLabel(request)}</div>
                  <div className="text-muted small">Подтверждено</div>
                </div>
                <div className="text-xl-end" style={{ minWidth: 200 }}>
                  <div className="text-muted small">Последнее обновление</div>
                  <div className="fw-medium">{formatDateTime(request.updatedAt)}</div>
                </div>
                <div className="d-flex flex-column flex-sm-row flex-xl-column gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpen(request, 'approve');
                    }}
                    disabled={!onOpen || isBusy(request.id)}
                  >
                    {isBusy(request.id) ? 'Обработка…' : 'Завершить'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpen(request, 'reject');
                    }}
                    disabled={!onOpen || isBusy(request.id)}
                  >
                    Отказать
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  );
}
