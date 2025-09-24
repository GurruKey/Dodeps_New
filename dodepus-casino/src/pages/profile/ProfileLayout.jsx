import { Container, Row, Col, Nav, Badge } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { AlertTriangle } from 'lucide-react';

export default function ProfileLayout() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const balance = user?.balance ?? 0;

  const fmt = (v) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(v);

  // простая эвристика: если чего-то важного нет — нужна верификация
  const needsKycAttention =
    !user?.emailVerified ||
    !user?.firstName ||
    !user?.lastName ||
    !user?.dob ||
    !user?.country ||
    !user?.city ||
    !user?.address;

  return (
    <Container>
      <Row className="g-4">
        <Col md={3}>
          <div className="profile-sidebar">
            <Nav variant="pills" className="flex-column gap-1">
              {/* БАЛАНС */}
              <Nav.Link
                as={NavLink}
                to="wallet"
                className="d-flex justify-content-between align-items-center"
              >
                <span>Баланс</span>
                <Badge bg="secondary">{fmt(balance)}</Badge>
              </Nav.Link>

              {/* ИСТОРИЯ ТРАНЗАКЦИЙ */}
              <Nav.Link as={NavLink} to="history">
                История транзакций
              </Nav.Link>

              {/* ТЕРМИНАЛ */}
              <Nav.Link as={NavLink} to="terminal">
                Терминал
              </Nav.Link>

              {/* разделитель */}
              <div className="my-2 border-top border-secondary" style={{ opacity: 0.5 }} />

              {/* ПЕРСОНАЛЬНЫЕ ДАННЫЕ */}
              <Nav.Link as={NavLink} end to="personal">
                Персональные данные
              </Nav.Link>

              {/* ВЕРИФИКАЦИЯ */}
              <Nav.Link as={NavLink} to="verification">
                {needsKycAttention ? (
                  <span className="d-inline-flex align-items-center gap-1 text-warning">
                    <AlertTriangle size={16} />
                    <span>Верификация</span>
                  </span>
                ) : (
                  'Верификация'
                )}
              </Nav.Link>

              {/* разделитель */}
              <div className="my-2 border-top border-secondary" style={{ opacity: 0.5 }} />

              {/* АКЦИИ / СЕЗОН */}
              <Nav.Link as={NavLink} to="promos">
                Акции для игры
              </Nav.Link>
              <Nav.Link as={NavLink} to="season">
                Сезон
              </Nav.Link>

              {/* разделитель */}
              <div className="my-2 border-top border-secondary" style={{ opacity: 0.5 }} />

              {/* ИСТОРИЯ ИГР */}
              <Nav.Link as={NavLink} to="games-history">
                История игр
              </Nav.Link>
            </Nav>
          </div>
        </Col>

        <Col md={9}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}
