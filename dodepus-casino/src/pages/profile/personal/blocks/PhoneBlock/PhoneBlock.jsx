import { Card, Form } from 'react-bootstrap';
import { useAuth } from '@/app/providers';
import {
  useVerificationModules,
  computeModuleLocks,
  formatModuleList,
} from '@/shared/verification';

export default function PhoneBlock() {
  const { user } = useAuth();
  const verification = useVerificationModules(user);
  const moduleLocks = computeModuleLocks(verification?.modules ?? {});
  const phoneLocked = moduleLocks.phone;

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Телефон</Card.Title>

        <Form.Group controlId="profile-phone">
          <Form.Label>Номер телефона</Form.Label>
          <Form.Control
            type="tel"
            value={user?.phone ?? ''}
            readOnly
            disabled={phoneLocked}
            autoComplete="tel"
          />
        </Form.Group>

        {phoneLocked ? (
          <div className="text-secondary small mt-3">
            Телефон защищён модулем верификации. Для обновления отправьте запрос в{' '}
            {formatModuleList(['phone'])}.
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}
