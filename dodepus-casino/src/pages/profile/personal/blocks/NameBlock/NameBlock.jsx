import { useState, useEffect } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../../../../../app/AuthContext.jsx';

export default function NameBlock() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName,  setLastName]  = useState(user?.lastName  ?? '');

  useEffect(() => setFirstName(user?.firstName ?? ''), [user?.firstName]);
  useEffect(() => setLastName(user?.lastName ?? ''),   [user?.lastName]);

  const changed =
    firstName !== (user?.firstName ?? '') ||
    lastName  !== (user?.lastName  ?? '');

  // сообщаем о "грязном" состоянии
  useEffect(() => {
    const id = 'block:name';
    window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: !!changed } }));
    return () => window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: false } }));
  }, [changed]);

  // сохраняем по общей кнопке
  useEffect(() => {
    const onSave = () => {
      if (!changed) return;
      updateProfile({ firstName: (firstName || '').trim(), lastName: (lastName || '').trim() });
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [changed, firstName, lastName, updateProfile]);

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Имя и фамилия</Card.Title>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text" placeholder="Иван" value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text" placeholder="Иванов" value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}
