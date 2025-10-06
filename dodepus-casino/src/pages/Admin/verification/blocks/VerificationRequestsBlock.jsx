import { Card, Button, ListGroup, Spinner } from 'react-bootstrap';
import VerificationFieldBadges from '../components/VerificationFieldBadges.jsx';
import {
  formatDateTime,
  getPendingVerificationTextClass,
  getProgressLabel,
  getUserDisplayName,
} from '../utils.js';

export default function VerificationRequestsBlock({
  requests = [],
  loading = false,
  onReload,
  onOpen,
}) {
  const totalRequests = Array.isArray(requests) ? requests.length : 0;
  const pendingCountClassName = getPendingVerificationTextClass(totalRequests);
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
                <span>Запросы на верификацию</span>
                <span className={`fw-semibold ${pendingCountClassName}`}>{totalRequests}</span>
              </span>
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Новые заявки от пользователей, ожидающие проверки администратором.
            </Card.Text>
          </div>
          {onReload && (
            <div className="d-flex align-items-center gap-2">
              <Button variant="outline-primary" onClick={onReload} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Обновление…
                  </>
                ) : (
                  'Обновить'
                )}
              </Button>
            </div>
          )}
        </div>
      </Card.Body>

      {totalRequests === 0 ? (
        <Card.Body className="border-top text-secondary small">
          {loading ? 'Загрузка запросов…' : 'Новых запросов нет.'}
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
                  <div className="text-muted small">Готово</div>
                  <div className="text-muted small mt-2">
                    Документов: {Array.isArray(request.attachments) ? request.attachments.length : 0}
                  </div>
                </div>
                <div className="text-xl-end" style={{ minWidth: 200 }}>
                  <div className="text-muted small">Отправлено</div>
                  <div className="fw-medium">{formatDateTime(request.submittedAt)}</div>
                  {request.updatedAt && request.updatedAt !== request.submittedAt && (
                    <div className="text-muted small">Обновлено {formatDateTime(request.updatedAt)}</div>
                  )}
                </div>
                <div className="text-muted small text-xl-end" style={{ minWidth: 160 }}>
                  Нажмите, чтобы открыть заявку
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  );
}
