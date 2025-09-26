import { Card, Button } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

export default function AccountIdBlock() {
  const { user } = useAuth();
  if (!user) return null;

  const copy = async () => {
    try { await navigator.clipboard?.writeText(user.id); } catch {}
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-2">ID аккаунта</Card.Title>
        <div className="d-flex align-items-center gap-2">
          <code className="fs-6">{user.id}</code>
          <Button size="sm" variant="outline-secondary" onClick={copy}>Копировать</Button>
        </div>
      </Card.Body>
    </Card>
  );
}
