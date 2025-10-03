import { Card, Nav, Stack } from 'react-bootstrap';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';

const navSections = [
  {
    id: 'roles-management',
    label: 'Управление ролями',
    items: [
      { to: 'assign', label: 'Выдать роль' },
      { to: 'edit', label: 'Изменить роль' },
    ],
  },
  {
    id: 'control',
    label: 'Контроль доступа',
    items: [
      { to: 'transactions', label: 'Транзакции' },
      { to: 'verification', label: 'Верификация' },
    ],
  },
  {
    id: 'communication',
    label: 'Коммуникации',
    items: [
      { to: 'moderation-chat', label: 'Чат модераторов' },
      { to: 'admin-chat', label: 'Чат администраторов' },
    ],
  },
];

export default function RolesLayout() {
  const { isLoading } = useOutletContext() ?? {};

  return (
    <Stack gap={3}>
      <Card>
        <Card.Body>
          <Card.Title as="h3" className="mb-1">
            Роли и права доступа
          </Card.Title>
          <Card.Text className="text-muted mb-0">
            Управление доступом сотрудников к разделам панели.{' '}
            {isLoading ? 'Синхронизация с данными выполняется…' : ''}
          </Card.Text>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Stack gap={3}>
            {navSections.map((section) => (
              <div key={section.id}>
                <div className="text-uppercase text-muted small fw-semibold mb-2">
                  {section.label}
                </div>
                <Nav variant="pills" className="flex-wrap gap-2">
                  {section.items.map((item) => (
                    <Nav.Link
                      key={item.to}
                      as={NavLink}
                      to={item.to}
                      className="px-3"
                    >
                      {item.label}
                    </Nav.Link>
                  ))}
                </Nav>
              </div>
            ))}
          </Stack>
        </Card.Body>
      </Card>

      <Outlet />
    </Stack>
  );
}
