import { useEffect, useMemo, useState } from 'react';
import { Card, Form, Button, Alert, InputGroup, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';
import { useVerificationState } from '../state/useVerificationState.js';

const DIAL_CODES = ['+380', '+7', '+375', '+370', '+371', '+372', '+48', '+995', '+374'];

const splitPhone = (full = '') => {
  if (typeof full !== 'string' || !full.trim()) {
    return { dial: '+380', number: '' };
  }

  const normalized = full.trim();
  if (!normalized.startsWith('+')) {
    return { dial: '+380', number: normalized.replace(/\D/g, '') };
  }

  const dial = DIAL_CODES.find((code) => normalized.startsWith(code));
  if (dial) {
    return { dial, number: normalized.slice(dial.length).replace(/\D/g, '') };
  }

  return { dial: '+380', number: normalized.replace(/\D/g, '') };
};

const composePhone = (dial, number) => {
  const digits = String(number ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const prefix = DIAL_CODES.includes(dial) ? dial : '+380';
  return `${prefix}${digits}`;
};

export function EmailVerificationForm({ layout = 'card', autoFocus = false }) {
  const { user, updateContacts } = useAuth();
  const { locks } = useVerificationState();

  const emailLocked = Boolean(locks.email);

  const [email, setEmail] = useState(user?.email ?? '');
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEmail(user?.email ?? '');
  }, [user?.email]);

  const trimmedEmail = (email || '').trim();
  const hasEmailChange = !emailLocked && trimmedEmail !== (user?.email ?? '').trim();

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: null, message: '' });

    if (!hasEmailChange) {
      setStatus({ type: 'info', message: 'Изменений нет — данные уже актуальны.' });
      return;
    }

    if (typeof updateContacts !== 'function') {
      setStatus({ type: 'error', message: 'Обновление почты временно недоступно.' });
      return;
    }

    setIsSaving(true);
    try {
      await Promise.resolve(updateContacts({ email: trimmedEmail }));
      setStatus({ type: 'success', message: 'Почта сохранена.' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить почту. Попробуйте ещё раз.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const infoMessage = emailLocked
    ? 'Поле блокируется, пока модуль проверяется или уже подтверждён.'
    : 'E-mail используется для входа и получения уведомлений.';

  const formContent = (
    <Form onSubmit={onSubmit} className="d-grid gap-3">
      <Form.Group>
        <Form.Label>Электронная почта</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(event) => {
            if (emailLocked) return;
            setEmail(event.target.value);
          }}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={emailLocked}
          autoFocus={autoFocus}
        />
      </Form.Group>

      <div className="text-secondary small">{infoMessage}</div>

      <div className="d-flex gap-2">
        <Button type="submit" disabled={!hasEmailChange || isSaving}>
          {isSaving ? 'Сохранение…' : 'Сохранить изменения'}
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          disabled={isSaving || !hasEmailChange}
          onClick={() => {
            setEmail(user?.email ?? '');
            setStatus({ type: null, message: '' });
          }}
        >
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
  );

  if (layout === 'plain') {
    return (
      <div className="d-grid gap-3">
        <div className="fw-semibold fs-5">Почта</div>
        {formContent}
      </div>
    );
  }

  return (
    <Card className="w-100">
      <Card.Body>
        <Card.Title className="mb-3">Почта</Card.Title>
        {formContent}
      </Card.Body>
    </Card>
  );
}

export function PhoneVerificationForm({ layout = 'card', autoFocus = false }) {
  const { user, updateContacts } = useAuth();
  const { locks } = useVerificationState();

  const phoneLocked = Boolean(locks.phone);

  const initialPhone = useMemo(() => splitPhone(user?.phone), [user?.phone]);
  const [dial, setDial] = useState(initialPhone.dial);
  const [number, setNumber] = useState(initialPhone.number);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const next = splitPhone(user?.phone);
    setDial(next.dial);
    setNumber(next.number);
  }, [user?.phone]);

  const currentPhone = useMemo(() => composePhone(dial, number), [dial, number]);
  const hasPhoneChange = !phoneLocked && currentPhone !== (user?.phone ?? '');

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
      await Promise.resolve(updateContacts({ phone: currentPhone }));
      setStatus({ type: 'success', message: 'Номер телефона сохранён.' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить номер. Попробуйте ещё раз.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const infoMessage = phoneLocked
    ? 'Поле блокируется, пока модуль проверяется или уже подтверждён.'
    : 'Номер телефона используется для входа и подтверждения личности.';

  const formContent = (
    <Form onSubmit={onSubmit} className="d-grid gap-3">
      <Form.Group>
        <Form.Label>Номер телефона</Form.Label>
        <InputGroup>
          <Dropdown onSelect={(value) => !phoneLocked && setDial(value || dial)}>
            <Dropdown.Toggle
              id="verification-phone-dial"
              variant="outline-secondary"
              className="flex-shrink-0"
              style={{ width: 96 }}
              disabled={phoneLocked}
            >
              {dial}
            </Dropdown.Toggle>
            <Dropdown.Menu align="start" style={{ minWidth: 96 }}>
              {DIAL_CODES.map((code) => (
                <Dropdown.Item key={code} eventKey={code} active={code === dial}>
                  {code}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Form.Control
            type="tel"
            value={number}
            placeholder="Номер"
            inputMode="numeric"
            maxLength={12}
            onChange={(event) => {
              if (phoneLocked) return;
              setNumber(event.target.value.replace(/\D/g, ''));
            }}
            autoComplete="tel"
            disabled={phoneLocked}
            autoFocus={autoFocus}
          />
        </InputGroup>
      </Form.Group>

      <div className="text-secondary small">{infoMessage}</div>

      <div className="d-flex gap-2">
        <Button type="submit" disabled={!hasPhoneChange || isSaving}>
          {isSaving ? 'Сохранение…' : 'Сохранить изменения'}
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          disabled={isSaving || !hasPhoneChange}
          onClick={() => {
            setDial(initialPhone.dial);
            setNumber(initialPhone.number);
            setStatus({ type: null, message: '' });
          }}
        >
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
  );

  if (layout === 'plain') {
    return (
      <div className="d-grid gap-3">
        <div className="fw-semibold fs-5">Телефон</div>
        {formContent}
      </div>
    );
  }

  return (
    <Card className="w-100">
      <Card.Body>
        <Card.Title className="mb-3">Телефон</Card.Title>
        {formContent}
      </Card.Body>
    </Card>
  );
}

export default EmailVerificationForm;
