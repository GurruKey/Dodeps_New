import { Card, Table, Badge } from 'react-bootstrap';

const roleMatrix = [
  {
    role: 'Модератор',
    key: 'moderator',
    permissions: ['Модерация чата', 'Просмотр клиентов'],
    status: 'active',
  },
  {
    role: 'Администратор',
    key: 'admin',
    permissions: ['Полный доступ', 'Изменение ролей', 'Настройка промокодов'],
    status: 'active',
  },
  {
    role: 'Стажёр',
    key: 'intern',
    permissions: ['Ограниченный просмотр'],
    status: 'draft',
  },
];

const statusLabels = {
  active: { label: 'Активна', variant: 'success' },
  draft: { label: 'Черновик', variant: 'secondary' },
};

export default function RolesMatrix() {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Матрица ролей</Card.Title>
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Роль</th>
              <th style={{ width: '60%' }}>Права</th>
              <th style={{ width: '20%' }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {roleMatrix.map((role) => {
              const status = statusLabels[role.status] ?? { label: role.status, variant: 'secondary' };
              return (
                <tr key={role.key}>
                  <td>{role.role}</td>
                  <td>
                    <ul className="mb-0 ps-3">
                      {role.permissions.map((permission) => (
                        <li key={permission}>{permission}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <Badge bg={status.variant}>{status.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
