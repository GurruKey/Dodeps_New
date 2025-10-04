import { useCallback, useMemo, useState } from 'react';
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
import PromoTypesGrid from './blocks/PromoTypesGrid.jsx';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Черновик' },
  { value: 'active', label: 'Активен' },
  { value: 'scheduled', label: 'Запланирован' },
  { value: 'paused', label: 'Пауза' },
  { value: 'expired', label: 'Истёк' },
];

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
};

const formatNumberInput = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
};

export default function PromoCodeCreate() {
  const [formValues, setFormValues] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedType = useMemo(
    () => promoTypeDefinitions.find((type) => type.id === formValues.typeId) ?? null,
    [formValues.typeId],
  );

  const handleTypeSelect = useCallback((typeId) => {
    const targetType = promoTypeDefinitions.find((type) => type.id === typeId);
    if (!targetType) return;

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
      };
    });

    setSuccess(null);
    setError(null);
  }, []);

  const handleFieldChange = useCallback((field) => {
    return (event) => {
      const value = event?.target?.value ?? '';
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };
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

      const payload = {
        typeId: formValues.typeId,
        code: formValues.code,
        title: formValues.title,
        reward: formValues.reward,
        limit: formValues.limit === '' ? null : Number(formValues.limit),
        status: formValues.status,
        wager: formValues.wager === '' ? null : Number(formValues.wager),
        cashoutCap:
          formValues.cashoutCap === '' ? null : Number(formValues.cashoutCap),
        notes: formValues.notes,
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
        }));
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
    <Stack gap={3} as="section" aria-label="Создание промокода">
      <Card>
        <Card.Body>
          <Card.Title as="h3" className="mb-2">
            Создать промокод
          </Card.Title>
          <Card.Text className="text-muted mb-0">
            Выберите тип промо, заполните поля и сохраните его в локальном симуляторе (local-sim).
          </Card.Text>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Stack gap={3}>
            <div>
              <h4 className="h5 mb-3">Тип промо</h4>
              <PromoTypesGrid selectedTypeId={formValues.typeId} onSelect={handleTypeSelect} />
            </div>

            <Form onSubmit={handleSubmit} noValidate>
              <Stack gap={3}>
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

                <Row className="g-3">
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

                <Form.Group controlId="promo-reward">
                  <Form.Label>Вознаграждение</Form.Label>
                  <Form.Control
                    type="text"
                    value={formValues.reward}
                    onChange={handleFieldChange('reward')}
                    placeholder="Например: 100% + 100 FS"
                  />
                </Form.Group>

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

                {selectedType && (
                  <Card bg="light" text="dark">
                    <Card.Body>
                      <Card.Title as="h6" className="mb-2">
                        Шпаргалка по типу «{selectedType.name}»
                      </Card.Title>
                      <Card.Text className="mb-1 text-muted">
                        {selectedType.howItWorks}
                      </Card.Text>
                      <Card.Text className="mb-1 small text-body-secondary">
                        {selectedType.formula}
                      </Card.Text>
                      <Card.Text className="mb-0 small fw-medium">
                        {selectedType.plainText}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                )}

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
                    {isSubmitting ? 'Сохраняем…' : 'Создать промокод'}
                  </Button>
                </div>
              </Stack>
            </Form>
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
}
