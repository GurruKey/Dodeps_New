import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Stack,
} from 'react-bootstrap';
import { createAdminPromocode } from '../../../../local-sim/admin/promocodes';
import { promoTypeDefinitions } from '../../../../local-sim/admin/promocodes/definitions';
import PromoTypesReference from './blocks/PromoTypesReference.jsx';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Черновик' },
  { value: 'active', label: 'Активен' },
  { value: 'scheduled', label: 'Запланирован' },
  { value: 'paused', label: 'Пауза' },
  { value: 'expired', label: 'Истёк' },
  { value: 'archived', label: 'Архив' },
];

const BALANCE_OPTIONS = [
  { value: 'main', label: 'Основной баланс' },
  { value: 'casino', label: 'Баланс казино' },
];

const emptyRewardForm = {
  depositPercent: '',
  depositMaxAmount: '',
  cashAmount: '',
  freeSpins: '',
  freeSpinsValue: '',
  freeSpinsGame: '',
  currency: '$',
  balanceType: 'main',
  customText: '',
};

const balanceLabelMap = {
  main: 'основной баланс',
  casino: 'баланс казино',
};

const emptyForm = {
  typeId: '',
  code: '',
  title: '',
  reward: '',
  limit: '',
  status: 'draft',
  wager: '',
  cashoutCap: '',
  notes: '',
  startsAt: '',
  endsAt: '',
  repeatLimit: '',
  repeatDelayHours: '',
};

const formatNumberInput = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
};

const formatDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const iso = date.toISOString();
  return iso.slice(0, 16);
};

const toIsoOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

const formatMoney = (value, currency) => {
  if (value === '' || value === null || value === undefined) return '';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return `${value} ${currency ?? ''}`.trim();
  }
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numeric);
  return `${formatted} ${currency ?? ''}`.trim();
};

const composeRewardPreview = (rewardForm) => {
  if (!rewardForm) return '';

  const parts = [];
  const currency = rewardForm.currency || '$';
  const balanceLabel = balanceLabelMap[rewardForm.balanceType] ?? 'баланс';

  if (rewardForm.depositPercent) {
    let depositPart = `${rewardForm.depositPercent}%`;
    if (rewardForm.depositMaxAmount) {
      depositPart += ` до ${formatMoney(rewardForm.depositMaxAmount, currency)}`;
    }
    depositPart += ` на ${balanceLabel}`;
    parts.push(depositPart);
  }

  if (rewardForm.cashAmount) {
    parts.push(`${formatMoney(rewardForm.cashAmount, currency)} на ${balanceLabel}`);
  }

  if (rewardForm.freeSpins) {
    let spinsPart = `${rewardForm.freeSpins} FS`;
    if (rewardForm.freeSpinsValue) {
      spinsPart += ` по ${formatMoney(rewardForm.freeSpinsValue, currency)}`;
    }
    if (rewardForm.freeSpinsGame) {
      spinsPart += ` в ${rewardForm.freeSpinsGame}`;
    }
    parts.push(spinsPart);
  }

  if (rewardForm.customText) {
    parts.push(rewardForm.customText);
  }

  return parts.join(' + ');
};

const normalizeRewardParams = (rewardForm) => {
  if (!rewardForm || typeof rewardForm !== 'object') return {};

  const toNullableNumber = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return numeric;
  };

  const normalized = {};

  const depositPercent = toNullableNumber(rewardForm.depositPercent);
  if (depositPercent != null) {
    normalized.depositPercent = depositPercent;
  }

  const depositMaxAmount = toNullableNumber(rewardForm.depositMaxAmount);
  if (depositMaxAmount != null) {
    normalized.depositMaxAmount = depositMaxAmount;
  }

  const cashAmount = toNullableNumber(rewardForm.cashAmount);
  if (cashAmount != null) {
    normalized.cashAmount = cashAmount;
  }

  const freeSpins = toNullableNumber(rewardForm.freeSpins);
  if (freeSpins != null) {
    normalized.freeSpins = freeSpins;
  }

  const freeSpinsValue = toNullableNumber(rewardForm.freeSpinsValue);
  if (freeSpinsValue != null) {
    normalized.freeSpinsValue = freeSpinsValue;
  }

  const freeSpinsGame =
    typeof rewardForm.freeSpinsGame === 'string' && rewardForm.freeSpinsGame.trim()
      ? rewardForm.freeSpinsGame.trim()
      : null;
  if (freeSpinsGame) {
    normalized.freeSpinsGame = freeSpinsGame;
  }

  const currency = rewardForm.currency || '$';
  if (currency) {
    normalized.currency = currency;
  }

  const balanceType = rewardForm.balanceType || 'main';
  if (balanceType) {
    normalized.balanceType = balanceType;
  }

  const customText =
    typeof rewardForm.customText === 'string' && rewardForm.customText.trim()
      ? rewardForm.customText.trim()
      : null;
  if (customText) {
    normalized.customText = customText;
  }

  const preview = composeRewardPreview(rewardForm);
  if (preview) {
    normalized.preview = preview;
  }

  return normalized;
};

export default function PromoCodeCreate() {
  const [formValues, setFormValues] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewardForm, setRewardForm] = useState(emptyRewardForm);
  const [rewardTouched, setRewardTouched] = useState(false);

  const selectedType = useMemo(
    () => promoTypeDefinitions.find((type) => type.id === formValues.typeId) ?? null,
    [formValues.typeId],
  );

  const rewardPreview = useMemo(() => composeRewardPreview(rewardForm), [rewardForm]);

  useEffect(() => {
    setFormValues((prev) => {
      if (rewardTouched) {
        return prev;
      }

      if (prev.reward === rewardPreview) {
        return prev;
      }

      return {
        ...prev,
        reward: rewardPreview,
      };
    });
  }, [rewardPreview, rewardTouched]);

  const handleTypeSelect = useCallback((typeId) => {
    const targetType = promoTypeDefinitions.find((type) => type.id === typeId);
    if (!targetType) return;

    const seedSchedule = targetType?.seed?.schedule ?? targetType?.seed?.params?.schedule ?? {};
    const repeatSeed = targetType?.seed?.params?.repeat ?? targetType?.seed?.repeat ?? {};

    setFormValues((prev) => {
      if (prev.typeId === typeId) {
        return prev;
      }

      return {
        ...prev,
        typeId,
        title: prev.title || targetType.name || '',
        reward: prev.reward || targetType?.seed?.reward || '',
        limit: prev.limit || formatNumberInput(targetType?.seed?.limit),
        wager:
          prev.wager !== '' && prev.wager !== null
            ? prev.wager
            : formatNumberInput(targetType?.seed?.wager),
        cashoutCap:
          prev.cashoutCap !== '' && prev.cashoutCap !== null
            ? prev.cashoutCap
            : formatNumberInput(targetType?.seed?.cashoutCap),
        notes: prev.notes || targetType?.seed?.notes || '',
        startsAt:
          prev.startsAt ||
          formatDateInputValue(targetType?.seed?.startsAt ?? seedSchedule.startsAt ?? null),
        endsAt:
          prev.endsAt ||
          formatDateInputValue(targetType?.seed?.endsAt ?? seedSchedule.endsAt ?? null),
        repeatLimit:
          prev.repeatLimit !== '' && prev.repeatLimit !== null
            ? prev.repeatLimit
            : formatNumberInput(repeatSeed?.limit ?? ''),
        repeatDelayHours:
          prev.repeatDelayHours !== '' && prev.repeatDelayHours !== null
            ? prev.repeatDelayHours
            : formatNumberInput(repeatSeed?.delayHours ?? ''),
      };
    });

    const seedParams = targetType?.seed?.params ?? {};
    const rewardSeed = seedParams.reward ?? {};
    setRewardForm({
      ...emptyRewardForm,
      currency:
        typeof rewardSeed.currency === 'string' && rewardSeed.currency
          ? rewardSeed.currency
          : typeof seedParams.currency === 'string' && seedParams.currency
          ? seedParams.currency
          : emptyRewardForm.currency,
      depositPercent: formatNumberInput(
        rewardSeed.depositPercent ?? seedParams.percent ?? seedParams.depositPercent,
      ),
      depositMaxAmount: formatNumberInput(
        rewardSeed.depositMaxAmount ?? seedParams.maxBonus ?? seedParams.depositMaxAmount,
      ),
      cashAmount: formatNumberInput(rewardSeed.cashAmount ?? seedParams.cashAmount ?? ''),
      freeSpins: formatNumberInput(
        rewardSeed.freeSpins ?? seedParams.maxFreeSpins ?? seedParams.freeSpins,
      ),
      freeSpinsValue: formatNumberInput(rewardSeed.freeSpinsValue ?? seedParams.freeSpinsValue ?? ''),
      freeSpinsGame:
        typeof (rewardSeed.freeSpinsGame ?? seedParams.freeSpinsGame) === 'string'
          ? rewardSeed.freeSpinsGame ?? seedParams.freeSpinsGame
          : '',
      balanceType:
        typeof (rewardSeed.balanceType ?? seedParams.balanceType) === 'string'
          ? rewardSeed.balanceType ?? seedParams.balanceType
          : emptyRewardForm.balanceType,
      customText:
        typeof rewardSeed.customText === 'string'
          ? rewardSeed.customText
          : typeof seedParams.customText === 'string'
          ? seedParams.customText
          : '',
    });
    setRewardTouched(false);

    setSuccess(null);
    setError(null);
  }, []);

  const handleFieldChange = useCallback((field) => {
    return (event) => {
      const value = event?.target?.value ?? '';
      if (field === 'reward') {
        setRewardTouched(true);
      }
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };
  }, []);

  const handleRewardFormChange = useCallback((field) => {
    return (event) => {
      const value = event?.target?.value ?? '';
      setRewardForm((prev) => ({ ...prev, [field]: value }));
      setRewardTouched(false);
    };
  }, []);

  const handleResetRewardToPreview = useCallback(() => {
    setRewardTouched(false);
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setError(null);
      setSuccess(null);

      if (!formValues.typeId) {
        setError(new Error('Выберите тип промокода.'));
        return;
      }

      const schedule = {
        startsAt: toIsoOrNull(formValues.startsAt),
        endsAt: toIsoOrNull(formValues.endsAt),
      };

      const rewardParams = normalizeRewardParams(rewardForm);

      const params = {};
      if (Object.keys(rewardParams).length > 0) {
        params.reward = rewardParams;
      }
      if (schedule.startsAt || schedule.endsAt) {
        params.schedule = schedule;
      }

      const repeatLimitValue =
        formValues.repeatLimit === '' || formValues.repeatLimit == null
          ? null
          : Number(formValues.repeatLimit);
      const repeatDelayValue =
        formValues.repeatDelayHours === '' || formValues.repeatDelayHours == null
          ? null
          : Number(formValues.repeatDelayHours);

      if (
        (repeatLimitValue != null && Number.isFinite(repeatLimitValue)) ||
        (repeatDelayValue != null && Number.isFinite(repeatDelayValue))
      ) {
        const repeat = {};
        if (repeatLimitValue != null && Number.isFinite(repeatLimitValue)) {
          repeat.limit = Math.max(0, Math.floor(repeatLimitValue));
        }
        if (repeatDelayValue != null && Number.isFinite(repeatDelayValue)) {
          const safeDelay = Math.max(0, repeatDelayValue);
          repeat.delayHours = Number.isInteger(safeDelay)
            ? safeDelay
            : Number(safeDelay.toFixed(2));
        }
        if (Object.keys(repeat).length > 0) {
          params.repeat = repeat;
        }
      }

      const payload = {
        typeId: formValues.typeId,
        code: formValues.code,
        title: formValues.title,
        reward: formValues.reward?.trim?.() ?? '',
        limit: formValues.limit === '' ? null : Number(formValues.limit),
        status: formValues.status,
        wager: formValues.wager === '' ? null : Number(formValues.wager),
        cashoutCap:
          formValues.cashoutCap === '' ? null : Number(formValues.cashoutCap),
        notes: formValues.notes,
        startsAt: schedule.startsAt,
        endsAt: schedule.endsAt,
        params,
      };

      setIsSubmitting(true);

      try {
        const created = createAdminPromocode(payload);
        setSuccess(`Промокод ${created.code} успешно создан.`);
        setFormValues((prev) => ({
          ...emptyForm,
          typeId: prev.typeId,
          title: selectedType?.name ?? '',
          reward: selectedType?.seed?.reward ?? '',
          limit: formatNumberInput(selectedType?.seed?.limit),
          wager: formatNumberInput(selectedType?.seed?.wager),
          cashoutCap: formatNumberInput(selectedType?.seed?.cashoutCap),
          notes: selectedType?.seed?.notes ?? '',
          startsAt: formatDateInputValue(selectedType?.seed?.startsAt),
          endsAt: formatDateInputValue(selectedType?.seed?.endsAt),
          repeatLimit: formatNumberInput(selectedType?.seed?.params?.repeat?.limit ?? ''),
          repeatDelayHours: formatNumberInput(
            selectedType?.seed?.params?.repeat?.delayHours ?? '',
          ),
        }));
        setRewardForm(emptyRewardForm);
        setRewardTouched(false);
      } catch (err) {
        const message = err instanceof Error ? err : new Error('Не удалось создать промокод');
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, selectedType],
  );

  return (
    <Stack gap={3} as="section" aria-label="Создание Promo">
      <Card>
        <Card.Body>
          <Card.Title as="h3" className="mb-2">
            Создать Promo
          </Card.Title>
          <Card.Text className="text-muted mb-0">
            Выберите тип промо, заполните поля и сохраните его в локальном симуляторе (local-sim).
          </Card.Text>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit} noValidate>
            <Stack gap={4}>
              <section>
                <h4 className="h5 mb-3">Кастомизация промокода</h4>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="promo-type">
                      <Form.Label>Тип промокода</Form.Label>
                      <Form.Select
                        value={formValues.typeId}
                        onChange={(event) => handleTypeSelect(event.target.value)}
                        required
                      >
                        <option value="">Выберите тип</option>
                        {promoTypeDefinitions.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="promo-status">
                      <Form.Label>Статус</Form.Label>
                      <Form.Select
                        value={formValues.status}
                        onChange={handleFieldChange('status')}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mt-0">
                  <Col md={4}>
                    <Form.Group controlId="promo-code">
                      <Form.Label>Код</Form.Label>
                      <Form.Control
                        type="text"
                        value={formValues.code}
                        onChange={handleFieldChange('code')}
                        placeholder={selectedType?.seed?.code ?? 'WELCOME100'}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group controlId="promo-title">
                      <Form.Label>Название</Form.Label>
                      <Form.Control
                        type="text"
                        value={formValues.title}
                        onChange={handleFieldChange('title')}
                        placeholder="Заголовок промо"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </section>

              <section>
                <h5 className="mb-3">Конструктор вознаграждения</h5>
                <p className="text-muted mb-3">
                  Укажите параметры бонуса — описание сформируется автоматически, но его можно
                  подправить вручную.
                </p>

                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group controlId="reward-deposit-percent">
                      <Form.Label>% на депозит</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={rewardForm.depositPercent}
                        onChange={handleRewardFormChange('depositPercent')}
                        placeholder="Например: 100"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="reward-deposit-max">
                      <Form.Label>Макс. бонус</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={rewardForm.depositMaxAmount}
                        onChange={handleRewardFormChange('depositMaxAmount')}
                        placeholder="Например: 5000"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="reward-currency">
                      <Form.Label>Валюта</Form.Label>
                      <Form.Control
                        type="text"
                        value={rewardForm.currency}
                        onChange={handleRewardFormChange('currency')}
                        placeholder="$"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group controlId="reward-cash">
                      <Form.Label>Фикс. начисление</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={rewardForm.cashAmount}
                        onChange={handleRewardFormChange('cashAmount')}
                        placeholder="Например: 500"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="reward-balance-type">
                      <Form.Label>Куда начислять</Form.Label>
                      <Form.Select
                        value={rewardForm.balanceType}
                        onChange={handleRewardFormChange('balanceType')}
                      >
                        {BALANCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="reward-custom-text">
                      <Form.Label>Доп. текст</Form.Label>
                      <Form.Control
                        type="text"
                        value={rewardForm.customText}
                        onChange={handleRewardFormChange('customText')}
                        placeholder="Например: Без отыгрыша"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group controlId="reward-free-spins">
                      <Form.Label>Фриспины</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={rewardForm.freeSpins}
                        onChange={handleRewardFormChange('freeSpins')}
                        placeholder="Например: 100"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="reward-free-spins-value">
                      <Form.Label>Ставка за спин</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={rewardForm.freeSpinsValue}
                        onChange={handleRewardFormChange('freeSpinsValue')}
                        placeholder="Например: 10"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="reward-free-spins-game">
                      <Form.Label>Игра для FS</Form.Label>
                      <Form.Control
                        type="text"
                        value={rewardForm.freeSpinsGame}
                        onChange={handleRewardFormChange('freeSpinsGame')}
                        placeholder="Например: Book of Ra"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group controlId="promo-reward">
                  <Form.Label>Описание вознаграждения</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formValues.reward}
                    onChange={handleFieldChange('reward')}
                    placeholder="Автосборка подсказки или свой текст"
                  />
                  <div className="d-flex flex-column flex-lg-row gap-2 align-items-lg-center mt-2">
                    <div className="small text-muted flex-grow-1">
                      Предпросмотр: {rewardPreview || '—'}
                    </div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      type="button"
                      onClick={handleResetRewardToPreview}
                    >
                      Подставить автосборку
                    </Button>
                  </div>
                </Form.Group>
              </section>

              <section>
                <h5 className="mb-3">Ограничения и сроки</h5>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group controlId="promo-limit">
                      <Form.Label>Лимит активаций</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formValues.limit}
                        onChange={handleFieldChange('limit')}
                        placeholder="Без лимита"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="promo-wager">
                      <Form.Label>Вейджер</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formValues.wager}
                        onChange={handleFieldChange('wager')}
                        placeholder="Например: 35"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="promo-cashout-cap">
                      <Form.Label>Кеп на вывод (×)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formValues.cashoutCap}
                        onChange={handleFieldChange('cashoutCap')}
                        placeholder="Например: 10"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="promo-starts-at">
                      <Form.Label>Начало действия</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={formValues.startsAt}
                        onChange={handleFieldChange('startsAt')}
                        placeholder="Сразу после создания"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="promo-ends-at">
                      <Form.Label>Окончание действия</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={formValues.endsAt}
                        onChange={handleFieldChange('endsAt')}
                        placeholder="Не ограничено"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </section>

              <section>
                <h5 className="mb-3">Повторные активации</h5>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="promo-repeat-limit">
                      <Form.Label>Количество повторов на игрока</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formValues.repeatLimit}
                        onChange={handleFieldChange('repeatLimit')}
                        placeholder="Без ограничений"
                      />
                      <Form.Text className="text-muted">
                        Оставьте пустым, чтобы разрешить бесконечное количество повторных активаций.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="promo-repeat-delay">
                      <Form.Label>Задержка между активациями (ч)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.5"
                        value={formValues.repeatDelayHours}
                        onChange={handleFieldChange('repeatDelayHours')}
                        placeholder="Например: 24"
                      />
                      <Form.Text className="text-muted">
                        Задайте минимальное время между активациями. 24 часа — раз в день.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </section>

              <section>
                <Form.Group controlId="promo-notes">
                  <Form.Label>Примечание</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formValues.notes}
                    onChange={handleFieldChange('notes')}
                    placeholder="Особые условия, ограничения, требования"
                  />
                </Form.Group>
              </section>

              {error && (
                <Alert variant="danger" className="mb-0">
                  {error.message}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-0">
                  {success}
                </Alert>
              )}

              <div className="d-flex justify-content-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Сохраняем…' : 'Создать Promo'}
                </Button>
              </div>
            </Stack>
          </Form>
        </Card.Body>
      </Card>

      <PromoTypesReference selectedTypeId={formValues.typeId} onSelect={handleTypeSelect} />
    </Stack>
  );
}
