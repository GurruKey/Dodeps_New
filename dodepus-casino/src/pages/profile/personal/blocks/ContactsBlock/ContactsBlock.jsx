import { useEffect, useMemo, useState } from 'react';
import { Card, Form, Row, Col, InputGroup, Dropdown, Alert } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';
import {
  useVerificationModules,
  computeModuleLocks,
} from '../../../../../shared/verification/index.js';

const DIAL_CODES = ['+380', '+7', '+375', '+370', '+371', '+372', '+48', '+995', '+374'];

function splitPhone(full) {
  if (!full || !full.startsWith('+')) return { dial: '+380', number: '' };
  const found = DIAL_CODES.find((code) => full.startsWith(code));
  if (found) return { dial: found, number: full.slice(found.length) };
  return { dial: '+380', number: full.replace(/^\+/, '') };
}

export default function ContactsBlock() {
  const { user, updateContacts } = useAuth();
  const verification = useVerificationModules(user);
  const moduleLocks = useMemo(
    () => computeModuleLocks(verification?.modules ?? {}),
    [verification?.modules],
  );

  const phoneInitial = useMemo(() => splitPhone(user?.phone || ''), [user?.phone]);
  const [dial, setDial] = useState(phoneInitial.dial);
  const [number, setNumber] = useState(phoneInitial.number.replace(/\D/g, ''));
  const [error, setError] = useState(null);

  useEffect(() => {
    const next = splitPhone(user?.phone || '');
    setDial(next.dial);
    setNumber(next.number.replace(/\D/g, ''));
  }, [user?.phone]);

  const email = useMemo(() => user?.email ?? '', [user?.email]);

  const currentPhone = useMemo(() => {
    const digits = number.replace(/\D/g, '');
    return digits ? `${dial}${digits}` : '';
  }, [dial, number]);

  const originalPhone = useMemo(() => {
    const origin = splitPhone(user?.phone || '');
    const digits = origin.number.replace(/\D/g, '');
    return digits ? `${origin.dial}${digits}` : '';
  }, [user?.phone]);

  const emailLocked = moduleLocks.email;
  const phoneLocked = moduleLocks.phone;

  const phoneChanged = !phoneLocked && currentPhone !== originalPhone;
  const hasChanges = phoneChanged;

  useEffect(() => {
    const id = 'block:contacts';
    window.dispatchEvent(
      new CustomEvent('personal:dirty', { detail: { id, dirty: Boolean(hasChanges) } }),
    );
    return () =>
      window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: false } }));
  }, [hasChanges]);

  useEffect(() => {
    setError(null);
  }, [dial, number]);

  useEffect(() => {
    const onSave = async () => {
      if (!hasChanges || phoneLocked || typeof updateContacts !== 'function') return;

      const payload = {};
      if (phoneChanged) payload.phone = currentPhone;

      try {
        await Promise.resolve(updateContacts(payload));
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Не удалось сохранить контакты. Попробуйте ещё раз.';
        setError(message);
        const id = 'block:contacts';
        window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: true } }));
      }
    };

    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [hasChanges, updateContacts, phoneChanged, currentPhone, phoneLocked]);

  const phoneError = error && /(телефон|номер)/i.test(error) ? error : null;
  const generalError = error && !phoneError ? error : null;

  const controlHeight = { minHeight: 'calc(1.5em + .75rem + 2px)' };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Контакты</Card.Title>

        <Row className="g-4">
          <Col md={6}>
            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Label>Номер телефона</Form.Label>
              <InputGroup>
                <Dropdown>
                  <Dropdown.Toggle
                    id="dial-code"
                    variant="outline-secondary"
                    className="flex-shrink-0"
                    style={{ width: 96, ...controlHeight }}
                    disabled={phoneLocked}
                  >
                    {dial}
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="start" style={{ minWidth: 96 }}>
                    {DIAL_CODES.map((code) => (
                      <Dropdown.Item
                        key={code}
                        active={code === dial}
                        onClick={() => !phoneLocked && setDial(code)}
                      >
                        {code}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                <Form.Control
                  type="tel"
                  inputMode="numeric"
                  placeholder="Номер"
                  value={number}
                  maxLength={12}
                  onChange={(e) => {
                    if (phoneLocked) return;
                    setNumber(e.target.value.replace(/\D/g, ''));
                  }}
                  autoComplete="tel"
                  className="flex-grow-1"
                  style={controlHeight}
                  isInvalid={Boolean(phoneError)}
                  disabled={phoneLocked}
                />
              </InputGroup>
              {phoneLocked ? (
                <Form.Text className="text-secondary d-block mt-1">
                  Номер заблокирован, пока запрос на проверке или подтверждён.
                </Form.Text>
              ) : null}
              {phoneError && (
                <Form.Text className="text-danger d-block mt-1">{phoneError}</Form.Text>
              )}
            </Form>
          </Col>

          <Col md={6}>
            <Form.Label>Электронная почта</Form.Label>
            <InputGroup>
              <Form.Control
                type="email"
                value={email}
                readOnly
                disabled={emailLocked}
                style={controlHeight}
                autoComplete="email"
              />
            </InputGroup>
            {emailLocked ? (
              <Form.Text className="text-secondary d-block mt-1">
                Почта закреплена за аккаунтом и недоступна для редактирования.
              </Form.Text>
            ) : null}
          </Col>
        </Row>

        {generalError && (
          <Alert variant="danger" className="mt-3 mb-0">
            {generalError}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}
