import { Badge, Card, Spinner, Stack } from 'react-bootstrap';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const formatUsage = (used, limit) => {
  const safeUsed = Number.isFinite(used) ? used : 0;
  if (limit == null) return `${safeUsed.toLocaleString('ru-RU')} использовано`;
  return `${safeUsed.toLocaleString('ru-RU')} из ${limit.toLocaleString('ru-RU')}`;
};

const formatConditions = (promo) => {
  const parts = [];
  if (promo.wager === 0) {
    parts.push('Без вейджера');
  } else if (typeof promo.wager === 'number' && Number.isFinite(promo.wager)) {
    parts.push(`Вейджер ×${promo.wager}`);
  }

  if (typeof promo.cashoutCap === 'number' && Number.isFinite(promo.cashoutCap)) {
    parts.push(`Кеп ×${promo.cashoutCap}`);
  }

  if (promo.repeatLimit != null || promo.repeatDelayHours != null) {
    const repeatParts = [];
    if (promo.repeatLimit != null) {
      repeatParts.push(`до ${promo.repeatLimit} повторов`);
    }
    if (promo.repeatDelayHours != null) {
      if (promo.repeatDelayHours >= 24 && Number.isInteger(promo.repeatDelayHours / 24)) {
        repeatParts.push(`каждые ${promo.repeatDelayHours / 24} д.`);
      } else {
        repeatParts.push(`каждые ${promo.repeatDelayHours} ч.`);
      }
    }
    if (repeatParts.length) {
      parts.push(`Повтор: ${repeatParts.join(' · ')}`);
    }
  }

  if (promo.notes) {
    parts.push(promo.notes);
  }

  return parts.join(' · ');
};

export default function PromoCodesTable({ promocodes, isLoading, onSelect, selectedId }) {
  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" size="sm" className="me-2" />
          Загрузка промокодов…
        </Card.Body>
      </Card>
    );
  }

  if (!promocodes.length) {
    return (
      <Card>
        <Card.Body className="text-center py-5 text-muted">
          Promo ещё не созданы. Добавьте первый через раздел «Создать Promo».
        </Card.Body>
      </Card>
    );
  }

  return (
    <Stack gap={3} className="promo-codes-list">
      {promocodes.map((promo) => {
        const conditions = formatConditions(promo);
        const isActive = selectedId === promo.id;
        return (
          <Card
            key={promo.id ?? promo.code}
            className={isActive ? 'active' : ''}
            onClick={() => onSelect?.(promo)}
            role="button"
          >
            <Card.Body className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <div className="small text-muted">Promo ID</div>
                  <div className="h5 mb-0">{promo.id}</div>
                </div>
                <Badge bg="secondary">{promo.statusLabel}</Badge>
              </div>

              <div className="d-flex flex-column flex-lg-row gap-4">
                <div className="flex-grow-1">
                  <div className="text-uppercase text-muted small mb-1">Сумма</div>
                  <div className="fw-semibold">{promo.reward || '—'}</div>
                </div>
                <div>
                  <div className="text-uppercase text-muted small mb-1">Использование</div>
                  <div>{formatUsage(promo.used, promo.limit)}</div>
                </div>
                <div>
                  <div className="text-uppercase text-muted small mb-1">Окончание</div>
                  <div>{formatDateTime(promo.endsAt)}</div>
                </div>
              </div>

              <div className="d-flex flex-column flex-lg-row gap-3 align-items-start">
                <div className="text-muted small">
                  <div className="text-uppercase text-muted mb-1">Условия</div>
                  <div>{conditions || '—'}</div>
                </div>
                <div className="text-muted small">
                  <div className="text-uppercase text-muted mb-1">Тип</div>
                  <div>{promo.type?.name ?? '—'}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </Stack>
  );
}
