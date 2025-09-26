import { Row, Col, Card, Button } from 'react-bootstrap';
import { Circle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../app/AuthContext.jsx';

export default function VerificationStatusBlock() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Локальные правила готовности (без БД)
  const emailDone = Boolean(user?.emailVerified);
  const phoneDone = !!(user?.phone && String(user.phone).replace(/\D/g, '').length >= 10);
  const addressDone = !!(user?.address && String(user.address).trim().length >= 5);
  const docDone = Array.isArray(user?.verificationUploads) && user.verificationUploads.length > 0;

  const items = [
    { key: 'email',   label: 'Почта',    done: emailDone },
    { key: 'phone',   label: 'Телефон',  done: phoneDone },
    { key: 'address', label: 'Адрес',    done: addressDone },
    { key: 'doc',     label: 'Документ', done: docDone },
  ];

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Статусы верификации</Card.Title>
        <Row className="text-center g-4">
          {items.map((s) => (
            <Col key={s.key} xs={6} md={3}>
              <div className="fw-medium mb-2">{s.label}</div>

              {/* Если выполнено — яркая галочка и НЕ кликабельна */}
              {s.done ? (
                <div
                  role="img"
                  aria-label={`${s.label}: выполнено`}
                  className="d-inline-flex align-items-center justify-content-center rounded-circle p-2 bg-success-subtle"
                  style={{ filter: 'drop-shadow(0 0 .6rem rgba(25,135,84,.7))' }}
                >
                  <CheckCircle size={56} className="text-success" />
                </div>
              ) : (
                // Если не выполнено — кликабельно, ведёт в Персональные данные
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => navigate('/profile/personal')}
                  aria-label={`Открыть Персональные данные: ${s.label}`}
                >
                  <Circle size={56} />
                </Button>
              )}
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
}
