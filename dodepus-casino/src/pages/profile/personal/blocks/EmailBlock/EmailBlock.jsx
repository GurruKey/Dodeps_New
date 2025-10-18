import { Card, Form } from 'react-bootstrap';
import { useAuth } from '@/app/providers';
import {
  useVerificationModules,
  computeModuleLocks,
} from '@/shared/verification';

export default function EmailBlock() {
  const { user } = useAuth();
  const verification = useVerificationModules(user);
  const moduleLocks = computeModuleLocks(verification?.modules ?? {});
  const emailLocked = moduleLocks.email;
  const controlHeight = { minHeight: 'calc(1.5em + .75rem + 2px)' };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Электронная почта</Card.Title>

        <Form.Group controlId="profile-email">
          <Form.Label>Электронная почта</Form.Label>
          <Form.Control
            type="email"
            value={user?.email ?? ''}
            readOnly
            disabled={emailLocked}
            autoComplete="email"
            style={controlHeight}
          />
          {emailLocked ? (
            <Form.Text className="text-secondary d-block mt-1">
              Почта закреплена за аккаунтом и недоступна для редактирования.
            </Form.Text>
          ) : null}
        </Form.Group>
      </Card.Body>
    </Card>
  );
}
