import { useState, useEffect, useMemo } from 'react';
import { Card, Form } from 'react-bootstrap';
import { useAuth } from '@/app/providers';
import {
  useVerificationModules,
  computeModuleLocks,
} from '@/shared/verification';

export default function SocialStatusBlock() {
  const { user, updateProfile } = useAuth();
  const verification = useVerificationModules(user);
  const locks = useMemo(
    () => computeModuleLocks(verification?.modules ?? {}),
    [verification?.modules],
  );
  const socialLocked = locks.doc;

  const [status, setStatus] = useState(user?.socialStatus ?? '');
  const [occupation, setOccupation] = useState(user?.occupation ?? '');

  useEffect(() => setStatus(user?.socialStatus ?? ''), [user?.socialStatus]);
  useEffect(() => setOccupation(user?.occupation ?? ''), [user?.occupation]);

  const changed =
    !socialLocked &&
    (status !== (user?.socialStatus ?? '') || occupation !== (user?.occupation ?? ''));

  useEffect(() => {
    const id = 'block:social';
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
      if (!changed || socialLocked) return;
      updateProfile({
        socialStatus: (status || '').trim(),
        occupation: (occupation || '').trim(),
      });
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [changed, occupation, status, updateProfile, socialLocked]);

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Социальный статус</Card.Title>
        <Form onSubmit={(event) => event.preventDefault()}>
          <Form.Group className="mb-3" controlId="profile-social-status">
            <Form.Label>Статус</Form.Label>
            <Form.Control
              type="text"
              placeholder="Работаю"
              value={status}
              onChange={(event) => {
                if (socialLocked) return;
                setStatus(event.target.value);
              }}
              disabled={socialLocked}
            />
          </Form.Group>
          <Form.Group controlId="profile-occupation">
            <Form.Label>Профессия</Form.Label>
            <Form.Control
              type="text"
              placeholder="Разработчик"
              value={occupation}
              onChange={(event) => {
                if (socialLocked) return;
                setOccupation(event.target.value);
              }}
              disabled={socialLocked}
            />
          </Form.Group>
        </Form>
        {socialLocked ? (
          <div className="text-secondary small mt-3">
            Изменение недоступно, пока документы на проверке или подтверждены.
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}
