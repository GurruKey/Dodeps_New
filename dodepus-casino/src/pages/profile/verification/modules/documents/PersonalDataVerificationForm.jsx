import { useEffect, useMemo, useState } from 'react';
import { Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { useAuth } from '@/app/providers';
import { useVerificationState } from '@/pages/profile/verification/state';
import { VerificationFormLayout } from '../shared';

const GENDER_OPTIONS = [
  { value: '', label: 'Выберите пол' },
  { value: 'male', label: 'Мужчина' },
  { value: 'female', label: 'Женщина' },
];

export function PersonalDataVerificationForm({ layout = 'card' }) {
  const { user, updateProfile } = useAuth();
  const { locks } = useVerificationState();

  const personalLocked = Boolean(locks.doc);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [gender, setGender] = useState(
    user?.gender === 'male' || user?.gender === 'female' ? user.gender : '',
  );
  const [dob, setDob] = useState(user?.dob ?? '');

  const [status, setStatus] = useState({ type: null, message: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setFirstName(user?.firstName ?? ''), [user?.firstName]);
  useEffect(() => setLastName(user?.lastName ?? ''), [user?.lastName]);
  useEffect(
    () => setGender(user?.gender === 'male' || user?.gender === 'female' ? user.gender : ''),
    [user?.gender],
  );
  useEffect(() => setDob(user?.dob ?? ''), [user?.dob]);

  const trimmed = useMemo(
    () => ({
      firstName: (firstName || '').trim(),
      lastName: (lastName || '').trim(),
      gender: (gender || '').trim(),
      dob: (dob || '').trim(),
    }),
    [firstName, lastName, gender, dob],
  );

  const hasPersonalChanges = !personalLocked && (
    trimmed.firstName !== (user?.firstName ?? '').trim() ||
    trimmed.lastName !== (user?.lastName ?? '').trim() ||
    trimmed.gender !== (user?.gender ?? '').trim() ||
    trimmed.dob !== (user?.dob ?? '').trim()
  );

  const hasChanges = hasPersonalChanges;

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
      patch.gender = trimmed.gender;
      patch.dob = trimmed.dob;
    }

    setIsSaving(true);
    try {
      await Promise.resolve(updateProfile(patch));
      setStatus({ type: 'success', message: 'Данные сохранены.' });
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

  const formContent = (
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
            value={dob}
            onChange={(event) => {
              if (personalLocked) return;
              setDob(event.target.value);
            }}
            disabled={personalLocked}
          />
        </Col>
      </Row>

      <div className="text-secondary small">
        {personalLocked
          ? 'Поля блокируются во время проверки документов. Отмените запрос или дождитесь решения администратора.'
          : 'Эти данные сравниваются с документами, которые вы загрузите.'}
      </div>

      <div className="d-flex justify-content-center">
        <Button type="submit" disabled={!hasChanges || isSaving}>
          {isSaving ? 'Сохранение…' : 'Сохранить данные'}
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
  );

  return (
    <VerificationFormLayout title="Персональные данные" layout={layout}>
      {formContent}
    </VerificationFormLayout>
  );
}

export default PersonalDataVerificationForm;
