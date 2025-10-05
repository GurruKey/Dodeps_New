import { useEffect, useMemo, useState } from 'react';
import { Card, Form, Row, Col, InputGroup, Dropdown, Alert } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';

const DIAL_CODES = ['+380', '+7', '+375', '+370', '+371', '+372', '+48', '+995', '+374'];

const LOCK_STATUSES = new Set(['pending', 'processing', 'partial', 'approved']);

function splitPhone(full) {
  if (!full || !full.startsWith('+')) return { dial: '+380', number: '' };
  const found = DIAL_CODES.find((code) => full.startsWith(code));
  if (found) return { dial: found, number: full.slice(found.length) };
  return { dial: '+380', number: full.replace(/^\+/, '') };
}

const toTimestamp = (value) => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getLatestFieldRequest = (requests, fieldKey) => {
  if (!Array.isArray(requests)) return null;

  return requests.reduce((latest, current) => {
    if (!current || typeof current !== 'object') return latest;
    const hasField = Boolean(
      current?.completedFields?.[fieldKey] || current?.requestedFields?.[fieldKey],
    );
    if (!hasField) return latest;
    if (!latest) return current;

    const latestTs = toTimestamp(latest.updatedAt || latest.reviewedAt || latest.submittedAt);
    const currentTs = toTimestamp(current.updatedAt || current.reviewedAt || current.submittedAt);
    return currentTs > latestTs ? current : latest;
  }, null);
};

export default function ContactsBlock() {
  const { user, updateContacts } = useAuth();

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

  const phoneRequest = useMemo(
    () => getLatestFieldRequest(user?.verificationRequests, 'phone'),
    [user?.verificationRequests],
  );

  const phoneRequestStatus = useMemo(
    () => String(phoneRequest?.status || '').toLowerCase(),
    [phoneRequest],
  );

  const emailLocked = true;
  const phoneLocked = LOCK_STATUSES.has(phoneRequestStatus);

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
  }, [dial, number, phoneLocked]);

  useEffect(() => {
    const onSave = async () => {
      if (!hasChanges || typeof updateContacts !== 'function') return;

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
  }, [hasChanges, updateContacts, phoneChanged, currentPhone]);

  const phoneError = error && /(телефон|номер)/i.test(error) ? error : null;
  const generalError = error && !phoneError ? error : null;

  const controlHeight = { minHeight: 'calc(1.5em + .75rem + 2px)' };

  const phoneLockHint = (() => {
    if (phoneRequestStatus === 'approved') {
      return 'Номер подтверждён и недоступен для изменения.';
    }
    if (LOCK_STATUSES.has(phoneRequestStatus) && phoneRequestStatus !== 'approved') {
      return 'Изменения номера заблокированы на время проверки.';
    }
    return null;
  })();

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
                        onClick={() => setDial(code)}
                        disabled={phoneLocked}
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
                  onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                  autoComplete="tel"
                  className="flex-grow-1"
                  style={controlHeight}
                  disabled={phoneLocked}
                  isInvalid={Boolean(phoneError)}
                />
              </InputGroup>
              {phoneError && (
                <Form.Text className="text-danger d-block mt-1">{phoneError}</Form.Text>
              )}
              {phoneLockHint && (
                <Form.Text className="text-muted d-block mt-1">{phoneLockHint}</Form.Text>
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
