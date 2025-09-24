import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

export default function NameBlock() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');

  // если профиль обновится извне — подтянуть значения
  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
  }, [user?.firstName, user?.lastName]);

  const changed =
    firstName !== (user?.firstName ?? '') ||
    lastName !== (user?.lastName ?? '');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!changed) return;
    updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Имя и фамилия</Card.Title>
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                placeholder="Иван"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                placeholder="Иванов"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Col>
          </Row>

          <div className="mt-3">
            <Button type="submit" variant="warning" disabled={!changed}>
              Сохранить
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
