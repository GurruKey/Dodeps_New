import { useState, useEffect, useMemo } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '@/app/providers';
import {
  useVerificationModules,
  computeModuleLocks,
} from '@/shared/verification';

export default function GenderDobBlock() {
  const { user, updateProfile } = useAuth();
  const verification = useVerificationModules(user);
  const locks = useMemo(
    () => computeModuleLocks(verification?.modules ?? {}),
    [verification?.modules],
  );
  const dobLocked = locks.doc;

  const [gender, setGender] = useState(user?.gender ?? '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? '');

  useEffect(() => setGender(user?.gender ?? ''), [user?.gender]);
  useEffect(() => setBirthDate(user?.birthDate ?? ''), [user?.birthDate]);

  const changed =
    !dobLocked &&
    (gender !== (user?.gender ?? '') || birthDate !== (user?.birthDate ?? ''));

  useEffect(() => {
    const id = 'block:gender';
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
      if (!changed || dobLocked) return;
      updateProfile({
        gender: (gender || '').trim(),
        birthDate: birthDate || null,
      });
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [changed, gender, birthDate, updateProfile, dobLocked]);

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Пол и дата рождения</Card.Title>
        <Row className="g-3">
          <Col md={6}>
            <Form.Label>Пол</Form.Label>
            <Form.Select
              value={gender}
              disabled={dobLocked}
              onChange={(event) => {
                if (dobLocked) return;
                setGender(event.target.value);
              }}
            >
              <option value="">Не выбран</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label>Дата рождения</Form.Label>
            <Form.Control
              type="date"
              value={birthDate ?? ''}
              onChange={(event) => {
                if (dobLocked) return;
                setBirthDate(event.target.value);
              }}
              disabled={dobLocked}
            />
          </Col>
        </Row>
        {dobLocked ? (
          <div className="text-secondary small mt-3">
            Изменение недоступно, пока документы на проверке или подтверждены.
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}
