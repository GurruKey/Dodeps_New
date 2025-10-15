import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Stack } from 'react-bootstrap';

const DEFAULT_COLOR = '#adb5bd';

const normalizeColor = (value) => {
  if (typeof value !== 'string') {
    return DEFAULT_COLOR;
  }
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return DEFAULT_COLOR;
  }
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return /^#([0-9a-f]{6})$/.test(normalized) ? normalized : DEFAULT_COLOR;
};

const normalizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/\r\n/g, '\n').trim();
};

const formatAmount = (value, currency = 'USD') => {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(safe);
};

const resolveTextColor = (hexColor) => {
  const hex = normalizeColor(hexColor).replace('#', '');
  if (hex.length !== 6) {
    return '#fff';
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return '#fff';
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? '#212529' : '#fff';
};

const buildInitialForm = (rank) => ({
  badgeColor: normalizeColor(rank?.badgeColor ?? DEFAULT_COLOR),
  tagline: rank?.tagline ?? '',
  description: rank?.description ?? '',
  purpose: rank?.purpose ?? '',
});

const isDirtyForm = (form, rank) => {
  if (!rank) {
    return false;
  }

  return (
    normalizeColor(form.badgeColor) !== normalizeColor(rank.badgeColor ?? DEFAULT_COLOR) ||
    normalizeText(form.tagline) !== normalizeText(rank.tagline ?? '') ||
    normalizeText(form.description) !== normalizeText(rank.description ?? '') ||
    normalizeText(form.purpose) !== normalizeText(rank.purpose ?? '')
  );
};

export default function RankListItem({ rank, levelMeta, onSave, isSaving }) {
  const [form, setForm] = useState(() => buildInitialForm(rank));
  const [localError, setLocalError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    setForm(buildInitialForm(rank));
    setLocalError(null);
  }, [rank]);

  const handleChange = (field) => (event) => {
    const value = event?.target?.value ?? '';
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setForm(buildInitialForm(rank));
    setLocalError(null);
    setLastSaved(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isDirtyForm(form, rank)) {
      return;
    }

    try {
      const updated = await onSave(rank.level, form);
      setLocalError(null);
      setLastSaved(new Date().toLocaleString('ru-RU'));
      if (updated) {
        setForm(buildInitialForm(updated));
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Не удалось сохранить изменения.');
    }
  };

  const colorPreview = useMemo(() => normalizeColor(form.badgeColor), [form.badgeColor]);
  const colorText = useMemo(() => resolveTextColor(colorPreview), [colorPreview]);
  const dirty = useMemo(() => isDirtyForm(form, rank), [form, rank]);

  const depositStep = levelMeta?.depositStep ?? null;
  const totalDeposit = levelMeta?.totalDeposit ?? null;

  return (
    <Card>
      <Card.Body as={Form} onSubmit={handleSubmit}>
        <Stack gap={3}>
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="fw-semibold fs-5">{rank.label}</span>
                <Badge
                  bg="secondary"
                  className="text-uppercase"
                  style={{
                    backgroundColor: colorPreview,
                    color: colorText,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  Цвет бейджа
                </Badge>
              </div>
              <div className="text-muted small">
                {rank.title || rank.displayTitle || rank.label}
              </div>
            </div>

            {depositStep !== null && totalDeposit !== null && (
              <div className="text-muted small text-lg-end">
                <div>Шаг депозита: {formatAmount(depositStep)}</div>
                <div>Сумма для ранга: {formatAmount(totalDeposit)}</div>
              </div>
            )}
          </div>

          <Row className="g-3">
            <Col xs={12} md={4}>
              <Form.Group controlId={`rank-color-${rank.level}`} className="mb-3">
                <Form.Label className="fw-medium">Цвет бейджа</Form.Label>
                <Form.Control
                  type="color"
                  value={colorPreview}
                  onChange={handleChange('badgeColor')}
                  title="Цвет бейджа"
                />
              </Form.Group>

              <Form.Group controlId={`rank-tagline-${rank.level}`}>
                <Form.Label className="fw-medium">Надпись рядом с уровнем</Form.Label>
                <Form.Control
                  type="text"
                  value={form.tagline}
                  onChange={handleChange('tagline')}
                  placeholder="Например: Старт"
                />
                <Form.Text className="text-muted">
                  Появится в профиле как «{rank.label} — {form.tagline || '…'}».
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group controlId={`rank-description-${rank.level}`}>
                <Form.Label className="fw-medium">Описание</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={form.description}
                  onChange={handleChange('description')}
                  placeholder="Коротко опишите бонусы уровня"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group controlId={`rank-purpose-${rank.level}`}>
                <Form.Label className="fw-medium">Цель / польза</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={form.purpose}
                  onChange={handleChange('purpose')}
                  placeholder="Зачем игроку этот уровень"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex flex-wrap gap-2">
            <Button type="submit" disabled={!dirty || isSaving}>
              {isSaving ? 'Сохраняем…' : 'Сохранить изменения'}
            </Button>
            <Button type="button" variant="outline-secondary" onClick={handleReset} disabled={isSaving || !dirty}>
              Отменить правки
            </Button>
          </div>

          {lastSaved && !localError && (
            <div className="text-success small">Сохранено {lastSaved}</div>
          )}

          {localError && (
            <Alert variant="danger" className="mb-0">
              {localError}
            </Alert>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}
