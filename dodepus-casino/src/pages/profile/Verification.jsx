import { Card } from 'react-bootstrap';
import { useAuth } from '../../app/AuthContext.jsx';

export default function Verification() {
  const { user } = useAuth();
  const ok =
    user?.emailVerified &&
    user?.firstName &&
    user?.lastName &&
    user?.dob &&
    user?.country &&
    user?.city &&
    user?.address;

  return (
    <Card>
      <Card.Body>
        <Card.Title>Верификация</Card.Title>
        <div className="text-muted">
          {ok
            ? 'Все необходимые данные заполнены. Дополнительных действий не требуется.'
            : 'Требуется внимание: заполните недостающие поля или подтвердите e-mail.'}
        </div>
      </Card.Body>
    </Card>
  );
}
