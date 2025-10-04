import { Card, Button, ListGroup } from 'react-bootstrap';
import VerificationFieldBadges from '../components/VerificationFieldBadges.jsx';
import { formatDateTime, getProgressLabel, getUserDisplayName } from '../utils.js';

export default function VerificationPartialBlock({
  requests = [],
  loading = false,
  onConfirm,
  onReject,
  busyId,
  onView,
  isVisible = true,
}) {
  const isBusy = (requestId) => busyId === requestId;

  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
          <div>
            <Card.Title as="h3" className="mb-1">
              Частичная верификация
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
      ) : requests.length === 0 ? (
        <Card.Body className="border-top text-secondary small">
          {loading ? 'Загрузка…' : 'Нет заявок на частичную проверку.'}
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
                  <div className="text-muted small">Последнее обновление</div>
                  <div className="fw-medium">{formatDateTime(request.updatedAt)}</div>
                </div>
                <div className="d-flex flex-column flex-sm-row flex-xl-column gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => onConfirm?.(request)}
                    disabled={!onConfirm || isBusy(request.id)}
                  >
                    {isBusy(request.id) ? 'Обработка…' : 'Завершить'}
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
