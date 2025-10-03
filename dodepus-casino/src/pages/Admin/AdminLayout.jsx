import { Container, Row, Col, Nav, Card, Stack } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';

const navSections = [
  {
    id: 'dashboard',
    label: 'Панель',
    items: [
      { to: 'overview', label: 'Обзор', end: true },
      { to: 'clients', label: 'Клиенты', end: true },
      { to: 'promocodes', label: 'Промокоды', end: true },
    ],
  },
  {
    id: 'roles',
    label: 'Роли и доступы',
    items: [
      { to: 'roles/assign', label: 'Выдать роль' },
      { to: 'roles/edit', label: 'Изменить роль' },
    ],
  },
  {
    id: 'control',
    label: 'Контроль',
    items: [
      { to: 'roles/transactions', label: 'Транзакции' },
      { to: 'roles/verification', label: 'Верификация' },
    ],
  },
  {
    id: 'communication',
    label: 'Коммуникации',
    items: [
      { to: 'roles/moderation-chat', label: 'Чат модераторов' },
      { to: 'roles/admin-chat', label: 'Чат администраторов' },
    ],
  },
];

export default function AdminLayout({ clients, isLoading, error, onReload }) {
  return (
    <Container className="mb-4">
      <h2 className="mb-3">Админ-панель</h2>
      <Row className="g-3">
        <Col xs={12} md={3} lg={2}>
          <Card className="h-100">
            <Card.Body className="p-3">
              <Stack gap={3}>
                {navSections.map((section) => (
                  <div key={section.id}>
                    <div className="text-uppercase text-muted small fw-semibold mb-2">
                      {section.label}
                    </div>
                    <Nav variant="pills" className="flex-column gap-1">
                      {section.items.map((item) => (
                        <Nav.Link key={item.to} as={NavLink} to={item.to} end={item.end}>
                          {item.label}
                        </Nav.Link>
                      ))}
                    </Nav>
                  </div>
                ))}
              </Stack>
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
