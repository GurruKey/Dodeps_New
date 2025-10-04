import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, ButtonGroup, Modal, Stack, Table } from 'react-bootstrap';
import ActivationChart from './ActivationChart.jsx';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatUsage = (used, limit) => {
  const safeUsed = Number.isFinite(used) ? used : 0;
  if (limit == null) {
    return `${safeUsed.toLocaleString('ru-RU')} использовано`;
  }
  return `${safeUsed.toLocaleString('ru-RU')} из ${limit.toLocaleString('ru-RU')}`;
};

const formatDelayHours = (delayHours) => {
  if (delayHours == null) return 'без задержки';
  if (delayHours === 0) return 'без задержки';
  if (delayHours >= 24) {
    const days = delayHours / 24;
    if (Number.isInteger(days)) {
      return `каждые ${days} д.`;
    }
  }
  return `каждые ${delayHours} ч.`;
};

const formatRepeat = (limit, delayHours) => {
  if (limit == null && delayHours == null) {
    return 'Без ограничений на повторную активацию';
  }
  const parts = [];
  if (limit != null) {
    parts.push(`до ${limit.toLocaleString('ru-RU')} раз на пользователя`);
  }
  if (delayHours != null) {
    parts.push(formatDelayHours(delayHours));
  }
  return parts.join(' · ');
};

const describeConditions = (promo) => {
  const parts = [];
  if (promo.wager === 0) {
    parts.push('Без вейджера');
  } else if (typeof promo.wager === 'number' && Number.isFinite(promo.wager)) {
    parts.push(`Вейджер ×${promo.wager}`);
  }

  if (typeof promo.cashoutCap === 'number' && Number.isFinite(promo.cashoutCap)) {
    parts.push(`Кеп ×${promo.cashoutCap}`);
  }

  if (promo.notes) {
    parts.push(promo.notes);
  }

  return parts.join(' · ');
};

const formatActivationClient = (activation, index) => {
  if (activation.clientId) return activation.clientId;
  return `unknown-${index + 1}`;
};

export default function PromoDetailsPanel({
  promo,
  show = false,
  onClose,
  onPause,
  onResume,
  onArchive,
  onExtend,
  isActionPending = false,
  actionError = null,
}) {
  const [chartRange, setChartRange] = useState('day');

  useEffect(() => {
    setChartRange('day');
  }, [promo?.id]);

  const activationList = useMemo(() => promo?.activations ?? [], [promo]);
  const conditions = useMemo(() => (promo ? describeConditions(promo) : ''), [promo]);
  const repeatInfo = useMemo(
    () => (promo ? formatRepeat(promo.repeatLimit, promo.repeatDelayHours) : ''),
    [promo],
  );

  if (!promo) return null;

  const canPause = promo.status === 'active' || promo.status === 'scheduled';
  const canResume = promo.status === 'paused';
  const isArchived = promo.status === 'archived';

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header
        closeButton
        className="d-flex justify-content-between align-items-start gap-3 flex-wrap"
      >
        <div>
          <div className="small text-muted">Promo ID</div>
          <div className="h5 mb-0">{promo.id}</div>
        </div>
        <Badge bg="secondary" className="mt-1">
          {promo.statusLabel}
        </Badge>
      </Modal.Header>
      <Modal.Body className="promo-details-panel">
        <Stack gap={4}>
          <section>
            <div className="d-flex flex-column flex-lg-row gap-4">
              <div className="flex-grow-1">
                <div className="text-uppercase text-muted small mb-2">Сумма</div>
                <div className="h5 mb-0">{promo.reward || '—'}</div>
              </div>
              <div>
                <div className="text-uppercase text-muted small mb-2">Использовано</div>
                <div className="h5 mb-0">{formatUsage(promo.used, promo.limit)}</div>
              </div>
              <div>
                <div className="text-uppercase text-muted small mb-2">Окончание</div>
                <div className="h6 mb-0">{formatDateTime(promo.endsAt)}</div>
              </div>
            </div>
            {conditions && <p className="text-muted mt-3 mb-0">{conditions}</p>}
          </section>

          <section>
            <ActivationChart
              activations={activationList}
              range={chartRange}
              onRangeChange={setChartRange}
            />
          </section>

          <section>
            <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
              <div>
                <h5 className="mb-1">Управление промо</h5>
                <p className="text-muted mb-0">Контролируйте статус и продлевайте срок действия.</p>
              </div>
              <ButtonGroup>
                <Button
                  variant="outline-warning"
                  disabled={!canPause || isActionPending}
                  onClick={() => onPause?.(promo.id)}
                >
                  Пауза
                </Button>
                <Button
                  variant="outline-success"
                  disabled={!canResume || isActionPending}
                  onClick={() => onResume?.(promo.id)}
                >
                  Возобновить
                </Button>
                <Button
                  variant="outline-primary"
                  disabled={isArchived || isActionPending}
                  onClick={() => onExtend?.(promo.id)}
                >
                  Добавить время
                </Button>
                <Button
                  variant="outline-danger"
                  disabled={isArchived || isActionPending}
                  onClick={() => onArchive?.(promo.id)}
                >
                  Архив
                </Button>
              </ButtonGroup>
            </div>
            {actionError && (
              <Alert variant="danger" className="mt-3 mb-0">
                {actionError.message}
              </Alert>
            )}
          </section>

          <section>
            <h5 className="mb-1">Повторные активации</h5>
            <p className="text-muted mb-0">{repeatInfo}</p>
          </section>

          <section>
            <h5 className="mb-3">История активаций</h5>
            {activationList.length > 0 ? (
              <div className="table-responsive">
                <Table size="sm" hover>
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>ID клиента</th>
                      <th style={{ width: '30%' }}>Время</th>
                      <th style={{ width: '30%' }}>Код</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activationList.slice(0, 30).map((activation, index) => (
                      <tr key={activation.id ?? index}>
                        <td className="fw-semibold">{formatActivationClient(activation, index)}</td>
                        <td>{formatDateTime(activation.activatedAt)}</td>
                        <td className="text-muted small">{promo.code}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p className="text-muted mb-0">Активации пока не зарегистрированы.</p>
            )}
          </section>
        </Stack>
      </Modal.Body>
    </Modal>
  );
}
