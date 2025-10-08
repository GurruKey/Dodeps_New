import { Badge, Button, Card, Collapse, ListGroup, Spinner } from 'react-bootstrap';
import { ChevronDown } from 'lucide-react';
import VerificationFieldBadges from '../components/VerificationFieldBadges.jsx';
import { formatDateTime } from '../utils.js';

export default function VerificationPartialBlock({
  requests = [],
  loading = false,
  onReload,
  onOpen,
  onOpenModule,
  expanded = false,
  onToggle,
}) {
  const totalRequests = Array.isArray(requests) ? requests.length : 0;

  const handleOpen = (entry) => {
    if (!onOpen) return;
    onOpen(entry);
  };

  const handleModuleOpen = (entry, module, event) => {
    event?.stopPropagation?.();
    if (!onOpenModule) return;
    onOpenModule(entry, module);
  };

  const sectionId = 'verification-partial';

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-body-tertiary py-3">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <button
            type="button"
            className="btn btn-link text-decoration-none text-body flex-grow-1 text-start"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={`${sectionId}-content`}
          >
            <span className="d-inline-flex align-items-center gap-3">
              <ChevronDown
                size={18}
                className="flex-shrink-0"
                style={{
                  transition: 'transform 0.2s ease',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
              <span className="fw-semibold">Частичная верификация</span>
              <Badge bg="secondary">{totalRequests}</Badge>
            </span>
          </button>
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
      </Card.Header>

      <Collapse in={expanded}>
        <div id={`${sectionId}-content`}>
          <Card.Body className="border-top">
            <Card.Text className="text-muted mb-0">
              Пользователи с частично подтверждёнными модулями. Проверьте новые данные и завершите процесс.
            </Card.Text>
          </Card.Body>

          {totalRequests === 0 ? (
            <Card.Body className="border-top text-secondary small">
              {loading ? 'Загрузка…' : 'Нет запросов на частичную проверку.'}
            </Card.Body>
          ) : (
            <ListGroup variant="flush" className="border-top">
              {requests.map((entry) => (
                <ListGroup.Item
                  key={entry.primaryRequest?.id || entry.userId}
                  className="py-3"
                  action={Boolean(onOpen)}
                  onClick={() => handleOpen(entry)}
                  style={onOpen ? { cursor: 'pointer' } : undefined}
                >
                  <div className="d-flex flex-column flex-xl-row gap-3 align-items-xl-start justify-content-between">
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{entry.userId}</div>
                      <div className="mt-3">
                        <VerificationFieldBadges
                          modules={entry.modules}
                          onSelect={(module, event) => handleModuleOpen(entry, module, event)}
                        />
                      </div>
                    </div>
                    <div className="text-xl-center" style={{ minWidth: 140 }}>
                      <div className="fw-medium">
                        {entry.summary.approved} / {entry.summary.total}
                      </div>
                      <div className="text-muted small">Подтверждено</div>
                    </div>
                    <div className="text-xl-end" style={{ minWidth: 200 }}>
                      <div className="text-muted small">Последнее обновление</div>
                      <div className="fw-medium">{formatDateTime(entry.updatedAt)}</div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Collapse>
    </Card>
  );
}
