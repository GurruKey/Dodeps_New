import { useEffect, useMemo, useState } from 'react';
import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';
import { useVerificationState } from '../state/useVerificationState.js';

const GENDER_OPTIONS = [
  { value: '', label: 'Выберите пол' },
  { value: 'male', label: 'Мужчина' },
  { value: 'female', label: 'Женщина' },
];

export function AddressVerificationForm() {
  const { user, updateProfile } = useAuth();
  const { locks } = useVerificationState();

  const addressLocked = Boolean(locks.address);
  const personalLocked = Boolean(locks.address || locks.doc);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [gender, setGender] = useState(
    user?.gender === 'male' || user?.gender === 'female' ? user.gender : '',
  );
  const [dob, setDob] = useState(user?.dob ?? '');
  const [country, setCountry] = useState(user?.country ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [address, setAddress] = useState(user?.address ?? '');

  const [status, setStatus] = useState({ type: null, message: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setFirstName(user?.firstName ?? ''), [user?.firstName]);
  useEffect(() => setLastName(user?.lastName ?? ''), [user?.lastName]);
  useEffect(() => setGender(user?.gender === 'male' || user?.gender === 'female' ? user.gender : ''), [user?.gender]);
  useEffect(() => setDob(user?.dob ?? ''), [user?.dob]);
  useEffect(() => setCountry(user?.country ?? ''), [user?.country]);
  useEffect(() => setCity(user?.city ?? ''), [user?.city]);
  useEffect(() => setAddress(user?.address ?? ''), [user?.address]);

  const trimmed = useMemo(
    () => ({
      firstName: (firstName || '').trim(),
      lastName: (lastName || '').trim(),
      country: (country || '').trim(),
      city: (city || '').trim(),
      address: (address || '').trim(),
      gender,
      dob: dob || null,
    }),
    [firstName, lastName, country, city, address, gender, dob],
  );

  const hasPersonalChanges = !personalLocked && (
    trimmed.firstName !== (user?.firstName ?? '').trim() ||
    trimmed.lastName !== (user?.lastName ?? '').trim() ||
    trimmed.gender !== (user?.gender === 'male' || user?.gender === 'female' ? user.gender : '') ||
    trimmed.dob !== (user?.dob ?? null)
  );

  const hasAddressChanges = !addressLocked && (
    trimmed.country !== (user?.country ?? '').trim() ||
    trimmed.city !== (user?.city ?? '').trim() ||
    trimmed.address !== (user?.address ?? '').trim()
  );

  const hasChanges = hasPersonalChanges || hasAddressChanges;

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
    if (hasPersonalChanges) {
      patch.firstName = trimmed.firstName;
      patch.lastName = trimmed.lastName;
      patch.gender = trimmed.gender || '';
      patch.dob = trimmed.dob;
    }
    if (hasAddressChanges) {
      patch.country = trimmed.country;
      patch.city = trimmed.city;
      patch.address = trimmed.address;
    }

    setIsSaving(true);
    try {
      await Promise.resolve(updateProfile(patch));
      setStatus({ type: 'success', message: 'Данные профиля сохранены.' });
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
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setGender(user?.gender === 'male' || user?.gender === 'female' ? user.gender : '');
    setDob(user?.dob ?? '');
    setCountry(user?.country ?? '');
    setCity(user?.city ?? '');
    setAddress(user?.address ?? '');
    setStatus({ type: null, message: '' });
  };

  return (
    <Card className="w-100">
      <Card.Body>
        <Card.Title className="mb-3">Персональные данные и адрес</Card.Title>
        <Form onSubmit={handleSubmit} className="d-grid gap-3">
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                value={firstName}
                onChange={(event) => {
                  if (personalLocked) return;
                  setFirstName(event.target.value);
                }}
                placeholder="Иван"
                disabled={personalLocked}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                value={lastName}
                onChange={(event) => {
                  if (personalLocked) return;
                  setLastName(event.target.value);
                }}
                placeholder="Иванов"
                disabled={personalLocked}
              />
            </Col>
          </Row>

          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Пол</Form.Label>
              <Form.Select
                value={gender}
                onChange={(event) => {
                  if (personalLocked) return;
                  setGender(event.target.value);
                }}
                disabled={personalLocked}
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Дата рождения</Form.Label>
              <Form.Control
                type="date"
                value={dob ?? ''}
                onChange={(event) => {
                  if (personalLocked) return;
                  setDob(event.target.value);
                }}
                disabled={personalLocked}
                max={new Date(Date.now() - 568025136000).toISOString().slice(0, 10)}
              />
            </Col>
          </Row>

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
            {addressLocked || personalLocked
              ? 'Поля блокируются во время проверки адреса или документов. Отмените запрос или дождитесь решения администратора.'
              : 'Эти данные необходимы для проверки адреса и документов.'}
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
