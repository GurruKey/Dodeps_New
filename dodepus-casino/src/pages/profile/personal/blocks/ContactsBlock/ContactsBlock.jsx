import { useEffect, useMemo, useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup, Badge, Spinner, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';

const DIAL_CODES = ['+380', '+7', '+375', '+370', '+371', '+372', '+48', '+995', '+374'];

function splitPhone(full) {
  if (!full || !full.startsWith('+')) return { dial: '+380', number: '' };
  const found = DIAL_CODES.find((code) => full.startsWith(code));
  if (found) return { dial: found, number: full.slice(found.length) };
  return { dial: '+380', number: full.replace(/^\+/, '') };
}

export default function ContactsBlock() {
  const { user, updateProfile } = useAuth();

  const initial = useMemo(() => splitPhone(user?.phone || ''), [user?.phone]);
  const [dial, setDial] = useState(initial.dial);
  const [number, setNumber] = useState(initial.number.replace(/\D/g, ''));

  useEffect(() => {
    const next = splitPhone(user?.phone || '');
    setDial(next.dial);
    setNumber(next.number.replace(/\D/g, ''));
  }, [user?.phone]);

  const phoneChanged = `${dial}${number}` !== (user?.phone || '');

  // dirty-индикатор только по телефону (email редактированию не подлежит)
  useEffect(() => {
    const id = 'block:contacts';
    window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: !!phoneChanged } }));
    return () => window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: false } }));
  }, [phoneChanged]);

  // Сохранение по общей кнопке
  useEffect(() => {
    const onSave = () => {
      if (!phoneChanged) return;
      const clean = String(number).replace(/\D/g, '');
      updateProfile({ phone: clean ? `${dial}${clean}` : '' });
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [phoneChanged, dial, number, updateProfile]);

  const email = user?.email || '';
  const emailVerified = !!user?.emailVerified;
  const [sending, setSending] = useState(false);
  const [sent,   setSent]     = useState(false);

  const requestEmailVerify = (e) => {
    e?.preventDefault?.();
    if (!email || emailVerified || sending) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      // updateProfile({ emailVerified: true });
    }, 800);
  };

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
                  <Dropdown.Toggle id="dial-code" variant="outline-secondary" className="flex-shrink-0" style={{ width: 96, ...controlHeight }}>
                    {dial}
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="start" style={{ minWidth: 96 }}>
                    {DIAL_CODES.map((code) => (
                      <Dropdown.Item key={code} active={code === dial} onClick={() => setDial(code)}>
                        {code}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                <Form.Control
                  type="tel" inputMode="numeric" placeholder="Номер" value={number}
                  maxLength={12} onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                  autoComplete="tel" className="flex-grow-1" style={controlHeight}
                />
              </InputGroup>
            </Form>
          </Col>

          <Col md={6}>
            <Form.Label>Электронная почта</Form.Label>
            <InputGroup>
              <Form.Control type="email" value={email} readOnly style={controlHeight} />
              {emailVerified ? (
                <InputGroup.Text className="bg-success-subtle text-success" style={controlHeight}>
                  <Badge bg="success">Подтверждён</Badge>
                </InputGroup.Text>
              ) : sent ? (
                <InputGroup.Text className="bg-secondary-subtle text-secondary" style={controlHeight}>
                  Отправлено
                </InputGroup.Text>
              ) : (
                <Button
                  variant="danger" onClick={requestEmailVerify}
                  disabled={!email || sending}
                  className="d-inline-flex align-items-center" style={controlHeight}
                >
                  {sending ? (<><Spinner animation="border" size="sm" className="me-2" />Отправляю…</>) : 'Подтвердить'}
                </Button>
              )}
            </InputGroup>
            {!emailVerified && sent && (
              <Form.Text className="text-muted d-block mt-1">Письмо отправлено (заглушка).</Form.Text>
            )}
            <Form.Text className="text-muted d-block mt-1">
              Для изменения электронной почты обратитесь в службу поддержки.
            </Form.Text>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
