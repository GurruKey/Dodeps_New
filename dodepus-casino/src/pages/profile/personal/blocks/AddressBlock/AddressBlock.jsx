import { useState, useEffect, useMemo } from 'react';
import { Card, Form } from 'react-bootstrap';
import { useAuth } from '@/app/providers';
import {
  useVerificationModules,
  computeModuleLocks,
  formatModuleList,
} from '@/shared/verification';

export default function AddressBlock() {
  const { user, updateProfile } = useAuth();
  const verification = useVerificationModules(user);
  const locks = useMemo(
    () => computeModuleLocks(verification?.modules ?? {}),
    [verification?.modules],
  );
  const addressLocked = locks.address;

  const [address, setAddress] = useState(user?.address ?? '');

  useEffect(() => setAddress(user?.address ?? ''), [user?.address]);

  const changed = !addressLocked && address !== (user?.address ?? '');

  useEffect(() => {
    const id = 'block:address';
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
      if (!changed || addressLocked) return;
      updateProfile({
        address: (address || '').trim(),
      });
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [address, addressLocked, changed, updateProfile]);

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Адрес</Card.Title>
        <Form.Group controlId="profile-address">
          <Form.Label>Адрес проживания</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={address}
            onChange={(event) => {
              if (addressLocked) return;
              setAddress(event.target.value);
            }}
            disabled={addressLocked}
          />
        </Form.Group>
        {addressLocked ? (
          <div className="text-secondary small mt-3">
            Адрес подтверждается модулем {formatModuleList(['address'])}. Изменение возможно после
            повторной верификации.
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}
