import { useState, useEffect } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';
import { useVerificationModules } from '../../../../../shared/verification/index.js';

export default function NameBlock() {
  const { user, updateProfile } = useAuth();
  const { modules: verificationModules = {} } = useVerificationModules(user);

  const docStatus = String(verificationModules?.doc?.status || '').toLowerCase();
  const docLocked = docStatus === 'pending' || docStatus === 'approved';

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');

  useEffect(() => setFirstName(user?.firstName ?? ''), [user?.firstName]);
  useEffect(() => setLastName(user?.lastName ?? ''), [user?.lastName]);

  const changed =
    firstName !== (user?.firstName ?? '') ||
    lastName !== (user?.lastName ?? '');

  useEffect(() => {
    const id = 'block:name';
    window.dispatchEvent(
      new CustomEvent('personal:dirty', { detail: { id, dirty: !docLocked && !!changed } }),
    );
    return () =>
      window.dispatchEvent(
        new CustomEvent('personal:dirty', { detail: { id, dirty: false } }),
      );
  }, [changed, docLocked]);

  useEffect(() => {
    const onSave = () => {
      if (!changed || docLocked) return;
      updateProfile({
        firstName: (firstName || '').trim(),
        lastName: (lastName || '').trim(),
      });
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [changed, docLocked, firstName, lastName, updateProfile]);

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Имя и фамилия</Card.Title>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                placeholder="Иван"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={docLocked}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                placeholder="Иванов"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={docLocked}
              />
            </Col>
          </Row>
          {docStatus === 'pending' && (
            <Form.Text className="text-muted d-block mt-2">
              Данные отправлены на проверку. Изменить ФИО можно после решения администратора.
            </Form.Text>
          )}
          {docStatus === 'approved' && (
            <Form.Text className="text-muted d-block mt-2">
              Документы подтверждены и заблокированы для редактирования.
            </Form.Text>
          )}
          {docStatus === 'rejected' && (
            <Form.Text className="text-warning d-block mt-2">
              Документы отклонены. Исправьте данные и отправьте их повторно.
            </Form.Text>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}
