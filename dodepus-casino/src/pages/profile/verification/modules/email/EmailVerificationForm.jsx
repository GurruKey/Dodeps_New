import { useEffect, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../../../../app/providers';
import { useVerificationState } from '../../state/useVerificationState.js';
import { VerificationFormLayout } from '../shared';

export function EmailVerificationForm({
  layout = 'card',
  autoFocus = false,
  onSubmitSuccess,
}) {
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
      if (typeof onSubmitSuccess === 'function') {
        onSubmitSuccess();
      }
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

      <div className="d-flex justify-content-center">
        <Button type="submit" disabled={!hasEmailChange || isSaving}>
          {isSaving ? 'Сохранение…' : 'Сохранить изменения'}
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
    <VerificationFormLayout title="Почта" layout={layout}>
      {formContent}
    </VerificationFormLayout>
  );
}

export default EmailVerificationForm;
