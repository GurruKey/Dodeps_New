import { Container, Row, Col, Nav, Card } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout({ clients, isLoading, error, onReload }) {
  return (
    <Container className="mb-4">
      <h2 className="mb-3">Админ-панель</h2>
      <Row className="g-3">
        <Col xs={12} md={3} lg={2}>
          <Card className="h-100">
            <Card.Body className="p-3">
              <Nav variant="pills" className="flex-column gap-1">
                <Nav.Link as={NavLink} to="overview" end>
                  Обзор
                </Nav.Link>
                <Nav.Link as={NavLink} to="clients" end>
                  Клиенты
                </Nav.Link>
                <Nav.Link as={NavLink} to="promocodes" end>
                  Промокоды
                </Nav.Link>
                <Nav.Link as={NavLink} to="roles" end>
                  Выдать роль
                </Nav.Link>
                <Nav.Link as={NavLink} to="role-edit" end>
                  Изменить роль
                </Nav.Link>
                <Nav.Link as={NavLink} to="transactions" end>
                  Транзакции
                </Nav.Link>
                <Nav.Link as={NavLink} to="verification" end>
                  Верификация
                </Nav.Link>
                <Nav.Link as={NavLink} to="moderators-chat" end>
                  Чат модераторов
                </Nav.Link>
                <Nav.Link as={NavLink} to="administrators-chat" end>
                  Админ Чат
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={9} lg={10}>
          <Outlet context={{ clients, isLoading, error, onReload }} />
        </Col>
      </Row>
    </Container>
  );
}
