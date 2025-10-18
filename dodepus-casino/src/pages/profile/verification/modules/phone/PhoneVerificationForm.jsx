import { useEffect, useMemo, useState } from 'react';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '@/app/providers';
import { useVerificationState } from '@/pages/profile/verification/state';
import { VerificationFormLayout } from '../shared';

const PHONE_CODES = ['+380', '+7', '+375', '+373', '+374'];

export function PhoneVerificationForm({ layout = 'card', onSubmitSuccess }) {
  const { user, updateContacts } = useAuth();
  const { locks } = useVerificationState();

  const phoneLocked = Boolean(locks.phone);
  const [prefix, setPrefix] = useState('+380');
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const userPhone = (user?.phone ?? '').trim();
    const match = PHONE_CODES.find((code) => userPhone.startsWith(code));
    if (match) {
      setPrefix(match);
      setNumber(userPhone.slice(match.length));
    } else {
      setNumber(userPhone);
    }
  }, [user?.phone]);

  const trimmedPhone = useMemo(() => `${prefix}${(number || '').replace(/\D+/g, '')}`, [prefix, number]);
  const hasPhoneChange = !phoneLocked && trimmedPhone !== (user?.phone ?? '').trim();

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: null, message: '' });

    if (!hasPhoneChange) {
      setStatus({ type: 'info', message: 'Изменений нет — данные уже актуальны.' });
      return;
    }

    if (typeof updateContacts !== 'function') {
      setStatus({ type: 'error', message: 'Обновление телефона временно недоступно.' });
      return;
    }

    setIsSaving(true);

    try {
      await Promise.resolve(updateContacts({ phone: trimmedPhone }));
      setStatus({ type: 'success', message: 'Телефон сохранён.' });
      if (typeof onSubmitSuccess === 'function') {
        onSubmitSuccess(trimmedPhone);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить телефон. Попробуйте ещё раз.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const formContent = (
    <Form onSubmit={onSubmit} className="d-grid gap-3">
      <Form.Group controlId="verification-phone">
        <Form.Label>Номер телефона</Form.Label>
        <InputGroup>
          <Form.Select
            value={prefix}
            onChange={(event) => {
              if (phoneLocked) return;
              setPrefix(event.target.value);
            }}
            disabled={phoneLocked}
          >
            {PHONE_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </Form.Select>
          <Form.Control
            type="tel"
            value={number}
            onChange={(event) => {
              if (phoneLocked) return;
              setNumber(event.target.value);
            }}
            placeholder="000 000 000"
            disabled={phoneLocked}
          />
        </InputGroup>
      </Form.Group>

      <div className="text-secondary small">
        {phoneLocked
          ? 'Телефон блокируется во время проверки. Отмените запрос или дождитесь решения администратора.'
          : 'Укажите номер, который будет подтверждён SMS-кодом.'}
      </div>

      <div className="d-flex justify-content-center">
        <Button type="submit" disabled={!hasPhoneChange || isSaving}>
          {isSaving ? 'Сохранение…' : 'Сохранить телефон'}
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
    <VerificationFormLayout title="Номер телефона" layout={layout}>
      {formContent}
    </VerificationFormLayout>
  );
}

export default PhoneVerificationForm;
