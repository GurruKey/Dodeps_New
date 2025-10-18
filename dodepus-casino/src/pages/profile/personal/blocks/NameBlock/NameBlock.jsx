import { useState, useEffect, useMemo } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '@/app/providers';
import {
  useVerificationModules,
  computeModuleLocks,
} from '@/shared/verification';

export default function NameBlock() {
  const { user, updateProfile } = useAuth();
  const verification = useVerificationModules(user);
  const locks = useMemo(
    () => computeModuleLocks(verification?.modules ?? {}),
    [verification?.modules],
  );
  const nameLocked = locks.doc;

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');

  useEffect(() => setFirstName(user?.firstName ?? ''), [user?.firstName]);
  useEffect(() => setLastName(user?.lastName ?? ''), [user?.lastName]);

  const changed =
    !nameLocked &&
    (firstName !== (user?.firstName ?? '') || lastName !== (user?.lastName ?? ''));

  useEffect(() => {
    const id = 'block:name';
    window.dispatchEvent(
      new CustomEvent('personal:dirty', { detail: { id, dirty: Boolean(changed) } }),
    );
    return () =>
      window.dispatchEvent(
        new CustomEvent('personal:dirty', { detail: { id, dirty: false } }),
      );
  }, [changed]);

  useEffect(() => {
    const onSave = () => {
      if (!changed || nameLocked) return;
      updateProfile({
        firstName: (firstName || '').trim(),
        lastName: (lastName || '').trim(),
      });
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [changed, firstName, lastName, updateProfile, nameLocked]);

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
                onChange={(e) => {
                  if (nameLocked) return;
                  setFirstName(e.target.value);
                }}
                disabled={nameLocked}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                placeholder="Иванов"
                value={lastName}
                onChange={(e) => {
                  if (nameLocked) return;
                  setLastName(e.target.value);
                }}
                disabled={nameLocked}
              />
            </Col>
          </Row>
        </Form>
        {nameLocked ? (
          <div className="text-secondary small mt-3">
            Поля блокируются, пока запрос по документам находится на проверке или подтверждён.
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}
