import { useEffect, useMemo, useState } from 'react';
import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';
import { useVerificationState } from '../state/useVerificationState.js';

export function AddressVerificationForm() {
  const { user, updateProfile } = useAuth();
  const { locks } = useVerificationState();

  const addressLocked = Boolean(locks.address);
  const [country, setCountry] = useState(user?.country ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [address, setAddress] = useState(user?.address ?? '');

  const [status, setStatus] = useState({ type: null, message: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setCountry(user?.country ?? ''), [user?.country]);
  useEffect(() => setCity(user?.city ?? ''), [user?.city]);
  useEffect(() => setAddress(user?.address ?? ''), [user?.address]);

  const trimmed = useMemo(
    () => ({
      country: (country || '').trim(),
      city: (city || '').trim(),
      address: (address || '').trim(),
    }),
    [country, city, address],
  );

  const hasAddressChanges = !addressLocked && (
    trimmed.country !== (user?.country ?? '').trim() ||
    trimmed.city !== (user?.city ?? '').trim() ||
    trimmed.address !== (user?.address ?? '').trim()
  );

  const hasChanges = hasAddressChanges;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: null, message: '' });

    if (!hasChanges) {
      setStatus({ type: 'info', message: 'Изменений нет — данные актуальны.' });
      return;
    }

    if (typeof updateProfile !== 'function') {
      setStatus({ type: 'error', message: 'Сохранение данных временно недоступно.' });
      return;
    }

    const patch = {};
    if (hasAddressChanges) {
      patch.country = trimmed.country;
      patch.city = trimmed.city;
      patch.address = trimmed.address;
    }

    setIsSaving(true);
    try {
      await Promise.resolve(updateProfile(patch));
      setStatus({ type: 'success', message: 'Адрес сохранён.' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить данные профиля. Попробуйте ещё раз.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setCountry(user?.country ?? '');
    setCity(user?.city ?? '');
    setAddress(user?.address ?? '');
    setStatus({ type: null, message: '' });
  };

  return (
    <Card className="w-100">
      <Card.Body>
        <Card.Title className="mb-3">Адрес проживания</Card.Title>
        <Form onSubmit={handleSubmit} className="d-grid gap-3">
          <Row className="g-3">
            <Col md={4}>
              <Form.Label>Страна</Form.Label>
              <Form.Control
                type="text"
                value={country}
                onChange={(event) => {
                  if (addressLocked) return;
                  setCountry(event.target.value);
                }}
                placeholder="Украина"
                disabled={addressLocked}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Город</Form.Label>
              <Form.Control
                type="text"
                value={city}
                onChange={(event) => {
                  if (addressLocked) return;
                  setCity(event.target.value);
                }}
                placeholder="Киев"
                disabled={addressLocked}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Адрес проживания</Form.Label>
              <Form.Control
                type="text"
                value={address}
                onChange={(event) => {
                  if (addressLocked) return;
                  setAddress(event.target.value);
                }}
                placeholder="Улица, дом, квартира"
                disabled={addressLocked}
              />
            </Col>
          </Row>

          <div className="text-secondary small">
            {addressLocked
              ? 'Поля блокируются во время проверки адреса. Отмените запрос или дождитесь решения администратора.'
              : 'Эти данные необходимы для проверки адреса.'}
          </div>

          <div className="d-flex gap-2">
            <Button type="submit" disabled={!hasChanges || isSaving}>
              {isSaving ? 'Сохранение…' : 'Сохранить изменения'}
            </Button>
            <Button type="button" variant="outline-secondary" disabled={isSaving} onClick={resetForm}>
              Сбросить
            </Button>
          </div>

          {status.type ? (
            <Alert
              variant={status.type === 'error' ? 'danger' : status.type === 'success' ? 'success' : 'secondary'}
              className="mb-0"
            >
              {status.message}
            </Alert>
          ) : null}
        </Form>
      </Card.Body>
    </Card>
  );
}

export default AddressVerificationForm;
