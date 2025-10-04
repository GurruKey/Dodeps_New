import { Card, Button, ListGroup, Spinner } from 'react-bootstrap';
import VerificationFieldBadges from '../components/VerificationFieldBadges.jsx';
import { formatDateTime, getProgressLabel, getUserDisplayName } from '../utils.js';

export default function VerificationRequestsBlock({
  requests = [],
  loading = false,
  onReload,
  onConfirm,
  onReject,
  busyId,
}) {
  const isBusy = (requestId) => busyId === requestId;

  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
          <div>
            <Card.Title as="h3" className="mb-1">
              Запросы на верификацию
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Новые заявки от пользователей, ожидающие проверки администратором.
            </Card.Text>
          </div>
          {onReload && (
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
          )}
        </div>
      </Card.Body>

      {requests.length === 0 ? (
        <Card.Body className="border-top text-secondary small">
          {loading ? 'Загрузка запросов…' : 'Новых запросов нет.'}
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
                <div className="d-flex flex-column flex-sm-row flex-xl-column gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => onConfirm?.(request)}
                    disabled={!onConfirm || isBusy(request.id)}
                  >
                    {isBusy(request.id) ? 'Обработка…' : 'Подтвердить'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => onReject?.(request)}
                    disabled={!onReject || isBusy(request.id)}
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
