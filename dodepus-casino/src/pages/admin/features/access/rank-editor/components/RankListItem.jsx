import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Collapse, Form, Row, Stack } from 'react-bootstrap';
import {
  BADGE_EFFECT_OPTIONS,
  buildBadgePreview,
  getBadgeEffectMeta,
  normalizeBadgeEffect,
  normalizeBadgeSpeed,
  normalizeHexColor,
  resolveAutoTextColor,
} from '../../../../../../shared/rank/badgeEffects.js';

const EFFECT_HINTS = {
  solid: 'Статичный фон без анимации — используйте один цвет.',
  gradient: 'Плавный градиент между тремя цветами, отлично подходит для VIP-лейблов.',
  rainbow: 'Не требует цветов — автоматически проигрывает радугу с переливами.',
  breathing: 'Мягкое дыхание между базовым и дополнительным цветом.',
  pulse: 'Лёгкая пульсация — хорошо подчёркивает важные уровни.',
  glow: 'Сияющее свечение вокруг бейджа для премиум-рангов.',
  shine: 'Блик, который периодически пробегает по поверхности бейджа.',
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

const buildInitialForm = (rank) => {
  const baseColor = normalizeHexColor(rank?.badgeColor);
  const secondaryColor = normalizeHexColor(rank?.badgeColorSecondary, baseColor);
  const tertiaryColor = normalizeHexColor(rank?.badgeColorTertiary, secondaryColor);
  const effect = normalizeBadgeEffect(rank?.badgeEffect);
  const speed = normalizeBadgeSpeed(rank?.badgeEffectSpeed);
  const textColor = normalizeHexColor(rank?.badgeTextColor, resolveAutoTextColor(baseColor));

  return {
    badgeColor: baseColor,
    badgeColorSecondary: secondaryColor,
    badgeColorTertiary: tertiaryColor,
    badgeTextColor: textColor,
    badgeEffect: effect,
    badgeEffectSpeed: speed,
    tagline: rank?.tagline ?? '',
    description: rank?.description ?? '',
    purpose: rank?.purpose ?? '',
  };
};

const isDirtyForm = (form, rank) => {
  if (!rank) {
    return false;
  }
  const reference = buildInitialForm(rank);
  return (
    form.badgeColor !== reference.badgeColor ||
    form.badgeColorSecondary !== reference.badgeColorSecondary ||
    form.badgeColorTertiary !== reference.badgeColorTertiary ||
    form.badgeTextColor !== reference.badgeTextColor ||
    form.badgeEffect !== reference.badgeEffect ||
    Number(form.badgeEffectSpeed) !== Number(reference.badgeEffectSpeed) ||
    normalizeText(form.tagline) !== normalizeText(reference.tagline) ||
    normalizeText(form.description) !== normalizeText(reference.description) ||
    normalizeText(form.purpose) !== normalizeText(reference.purpose)
  );
};

export default function RankListItem({ rank, levelMeta, onSave, isSaving }) {
  const [form, setForm] = useState(() => buildInitialForm(rank));
  const [localError, setLocalError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setForm(buildInitialForm(rank));
    setLocalError(null);
    setLastSaved(null);
  }, [rank]);

  const effectMeta = useMemo(() => getBadgeEffectMeta(form.badgeEffect), [form.badgeEffect]);
  const effectHint = EFFECT_HINTS[effectMeta.value] ?? EFFECT_HINTS.solid;

  const preview = useMemo(() => buildBadgePreview(form), [form]);
  const savedPreview = useMemo(() => buildBadgePreview(rank ?? {}), [rank]);
  const dirty = useMemo(() => isDirtyForm(form, rank), [form, rank]);

  const depositStep = levelMeta?.depositStep ?? null;
  const totalDeposit = levelMeta?.totalDeposit ?? null;

  const handleColorChange = (field) => (event) => {
    const value = event?.target?.value ?? '';
    setForm((prev) => ({ ...prev, [field]: normalizeHexColor(value, prev[field]) }));
  };

  const handleTextChange = (field) => (event) => {
    const value = event?.target?.value ?? '';
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEffectChange = (event) => {
    const value = event?.target?.value ?? 'solid';
    setForm((prev) => ({ ...prev, badgeEffect: normalizeBadgeEffect(value) }));
  };

  const handleSpeedChange = (event) => {
    const value = event?.target?.value ?? '';
    setForm((prev) => ({ ...prev, badgeEffectSpeed: normalizeBadgeSpeed(value, prev.badgeEffectSpeed) }));
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
      const payload = {
        badgeColor: normalizeHexColor(form.badgeColor),
        badgeColorSecondary: normalizeHexColor(form.badgeColorSecondary, form.badgeColor),
        badgeColorTertiary: normalizeHexColor(form.badgeColorTertiary, form.badgeColorSecondary || form.badgeColor),
        badgeTextColor: normalizeHexColor(form.badgeTextColor, resolveAutoTextColor(form.badgeColor)),
        badgeEffect: normalizeBadgeEffect(form.badgeEffect),
        badgeEffectSpeed: normalizeBadgeSpeed(form.badgeEffectSpeed),
        tagline: form.tagline,
        description: form.description,
        purpose: form.purpose,
      };

      const updated = await onSave(rank.level, payload);
      setLocalError(null);
      setLastSaved(new Date().toLocaleString('ru-RU'));
      if (updated) {
        setForm(buildInitialForm(updated));
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Не удалось сохранить изменения.');
    }
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-body-tertiary">
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
          <div className="d-flex flex-column gap-2 flex-grow-1">
            <div className="d-flex flex-wrap align-items-center gap-3">
              <Button
                type="button"
                variant="link"
                onClick={toggleOpen}
                className="p-0 d-inline-flex align-items-center gap-2 text-decoration-none"
                aria-expanded={isOpen}
              >
                <span className="fs-4 lh-1 text-body">{isOpen ? '▾' : '▸'}</span>
                <span className="fw-semibold fs-5 text-body">{rank.label}</span>
              </Button>
              <Badge bg="secondary" className={`${savedPreview.className} px-3`} style={savedPreview.style}>
                {rank.label}
              </Badge>
            </div>
            <div className="text-muted small">{rank.title || rank.displayTitle || rank.label}</div>
          </div>

          {depositStep !== null && totalDeposit !== null && (
            <div className="text-muted small text-lg-end">
              <div>Шаг пополнения: {formatAmount(depositStep)}</div>
              <div>Сумма для ранга: {formatAmount(totalDeposit)}</div>
            </div>
          )}
        </div>
      </Card.Header>

      <Collapse in={isOpen}>
        <div>
          <Card.Body as={Form} onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Row className="g-4">
                <Col xs={12} lg={4}>
                  <Stack gap={3}>
                    <Form.Group controlId={`rank-badge-color-${rank.level}`}>
                      <Form.Label className="fw-medium">Основной цвет бейджа</Form.Label>
                      <Form.Control type="color" value={form.badgeColor} onChange={handleColorChange('badgeColor')} />
                    </Form.Group>

                    {effectMeta.requiresSecondary && (
                      <Form.Group controlId={`rank-badge-secondary-${rank.level}`}>
                        <Form.Label className="fw-medium">Дополнительный цвет</Form.Label>
                        <Form.Control
                          type="color"
                          value={form.badgeColorSecondary}
                          onChange={handleColorChange('badgeColorSecondary')}
                        />
                        <Form.Text className="text-muted">
                          Используется для эффекта «{effectMeta.label.toLowerCase()}».
                        </Form.Text>
                      </Form.Group>
                    )}

                    {(effectMeta.requiresTertiary || form.badgeColorTertiary !== form.badgeColorSecondary) && (
                      <Form.Group controlId={`rank-badge-tertiary-${rank.level}`}>
                        <Form.Label className="fw-medium">Третий цвет</Form.Label>
                        <Form.Control
                          type="color"
                          value={form.badgeColorTertiary}
                          onChange={handleColorChange('badgeColorTertiary')}
                        />
                        <Form.Text className="text-muted">Добавляет глубину градиенту.</Form.Text>
                      </Form.Group>
                    )}

                    <Form.Group controlId={`rank-badge-text-${rank.level}`}>
                      <Form.Label className="fw-medium">Цвет букв VIP</Form.Label>
                      <Form.Control
                        type="color"
                        value={form.badgeTextColor}
                        onChange={handleColorChange('badgeTextColor')}
                      />
                    </Form.Group>

                    <Form.Group controlId={`rank-badge-effect-${rank.level}`}>
                      <Form.Label className="fw-medium">Эффект бейджа</Form.Label>
                      <Form.Select value={form.badgeEffect} onChange={handleEffectChange}>
                        {BADGE_EFFECT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">{effectHint}</Form.Text>
                    </Form.Group>

                    <Form.Group controlId={`rank-badge-speed-${rank.level}`}>
                      <Form.Label className="fw-medium">Скорость анимации ({form.badgeEffectSpeed}s)</Form.Label>
                      <Form.Range
                        min={2}
                        max={12}
                        step={0.5}
                        value={form.badgeEffectSpeed}
                        onChange={handleSpeedChange}
                        disabled={effectMeta.value === 'solid'}
                      />
                    </Form.Group>
                  </Stack>
                </Col>

                <Col xs={12} lg={4}>
                  <Stack gap={3}>
                    <Form.Group controlId={`rank-tagline-${rank.level}`}>
                      <Form.Label className="fw-medium">Надпись рядом с уровнем</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.tagline}
                        onChange={handleTextChange('tagline')}
                        placeholder="Например: Старт"
                      />
                      <Form.Text className="text-muted">
                        В профиле отобразится как «{rank.label} — {form.tagline || '…'}».
                      </Form.Text>
                    </Form.Group>

                    <Form.Group controlId={`rank-description-${rank.level}`}>
                      <Form.Label className="fw-medium">Описание</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        value={form.description}
                        onChange={handleTextChange('description')}
                        placeholder="Коротко опишите бонусы уровня"
                      />
                    </Form.Group>
                  </Stack>
                </Col>

                <Col xs={12} lg={4}>
                  <Stack gap={3}>
                    <Form.Group controlId={`rank-purpose-${rank.level}`}>
                      <Form.Label className="fw-medium">Цель / польза</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        value={form.purpose}
                        onChange={handleTextChange('purpose')}
                        placeholder="Зачем игроку этот уровень"
                      />
                    </Form.Group>

                    <div className="border rounded-4 p-3 bg-body-secondary">
                      <div className="text-muted fw-semibold small mb-2">Предпросмотр</div>
                      <div className="d-flex flex-column gap-2 align-items-start">
                        <Badge bg="secondary" className={`${preview.className} px-4 py-2`} style={preview.style}>
                          {rank.label}
                        </Badge>
                        <div className="fw-semibold" style={{ color: preview.textColor }}>
                          {rank.label} — {form.tagline || '…'}
                        </div>
                      </div>
                    </div>
                  </Stack>
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
        </div>
      </Collapse>
    </Card>
  );
}
