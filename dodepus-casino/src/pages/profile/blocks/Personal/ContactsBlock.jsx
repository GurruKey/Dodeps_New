import { useEffect, useMemo, useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

const DIAL_CODES = [
  { c: 'UA', code: '+380' },
  { c: 'KZ', code: '+7' },
  { c: 'RU', code: '+7' },
  { c: 'BY', code: '+375' },
  { c: 'LT', code: '+370' },
  { c: 'LV', code: '+371' },
  { c: 'EE', code: '+372' },
  { c: 'PL', code: '+48' },
  { c: 'GE', code: '+995' },
  { c: 'AM', code: '+374' },
];

function splitPhone(full) {
  if (!full || !full.startsWith('+')) return { dial: '+380', number: '' };
  const found = DIAL_CODES.find((d) => full.startsWith(d.code));
  if (found) return { dial: found.code, number: full.slice(found.code.length) };
  return { dial: '+380', number: full.replace(/^\+/, '') };
}

export default function ContactsBlock() {
  const { user, updateProfile } = useAuth();

  const initial = useMemo(() => splitPhone(user?.phone || ''), [user?.phone]);
  const [dial, setDial] = useState(initial.dial);
  const [number, setNumber] = useState(initial.number.replace(/\D/g, ''));

  useEffect(() => {
    const { dial, number } = splitPhone(user?.phone || '');
    setDial(dial);
    setNumber(number.replace(/\D/g, ''));
  }, [user?.phone]);

  const phoneChanged = `${dial}${number}` !== (user?.phone || '');
  const savePhone = (e) => {
    e.preventDefault();
    const clean = number.replace(/\D/g, '');
    updateProfile({ phone: clean ? `${dial}${clean}` : '' });
  };

  const email = user?.email || '';
  const emailVerified = !!user?.emailVerified;
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const requestEmailVerify = async (e) => {
    e.preventDefault();
    if (!email || emailVerified) return;
    setSending(true);
    // Заглушка: имитируем отправку письма и «подтверждение»
    setTimeout(() => {
      setSending(false);
      setSent(true);
      // Если хочешь видеть статус "подтверждён", раскомментируй:
      // updateProfile({ emailVerified: true });
    }, 800);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Контакты</Card.Title>

        <Row className="g-3 align-items-end">
          <Col md={6}>
            <Form onSubmit={savePhone}>
              <Form.Label>Номер телефона</Form.Label>
              <InputGroup>
                <Form.Select
                  value={dial}
                  onChange={(e) => setDial(e.target.value)}
                  style={{ maxWidth: 110 }}
                >
                  {DIAL_CODES.map((d) => (
                    <option key={d.c + d.code} value={d.code}>
                      {d.c} {d.code}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control
                  type="tel"
                  placeholder="XXXXXXXXXXXX"
                  value={number}
                  onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                  autoComplete="tel"
                />
              </InputGroup>
              <div className="mt-2">
                <Button type="submit" variant="warning" disabled={!phoneChanged}>
                  Сохранить
                </Button>
              </div>
            </Form>
          </Col>

          <Col md={6}>
            <Form.Label>Электронная почта</Form.Label>
            <div className="d-flex align-items-center justify-content-between">
              <Form.Control type="email" value={email} readOnly />
            </div>
            <div className="mt-1">
              {emailVerified ? (
                <Badge bg="success">Подтверждён</Badge>
              ) : (
                <>
                  <Button
                    variant="link"
                    className="p-0 text-danger"
                    onClick={requestEmailVerify}
                    disabled={!email || sending}
                  >
                    {sending ? 'Отправляю…' : 'Подтвердить'}
                  </Button>
                  {sent && (
                    <span className="ms-2 text-muted">
                      Письмо отправлено (заглушка).
                    </span>
                  )}
                </>
              )}
            </div>
            <Form.Text className="text-muted">
              Для изменения электронной почты обратитесь в службу поддержки.
            </Form.Text>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
