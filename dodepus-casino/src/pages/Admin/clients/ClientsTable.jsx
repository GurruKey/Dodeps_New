import { Alert, Badge, Spinner, Table } from 'react-bootstrap';

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const statusLabels = {
  active: 'Активный',
  ban: 'Бан',
};

const statusVariants = {
  active: 'success',
  ban: 'danger',
};

function formatRole(role) {
  if (!role) return '—';

  const labelMap = {
    user: 'Юзер',
    intern: 'Стажёр',
    moderator: 'Модератор',
    admin: 'Админ',
    owner: 'Owner',
  };

  const base = labelMap[role.group] ?? role.group;
  if (role.level) {
    return `${base} ${role.level}`;
  }
  return base;
}

export default function ClientsTable({ clients, isLoading, error }) {
  if (error) {
    return (
      <Alert variant="danger" className="mb-0">
        Не удалось показать таблицу клиентов: {error.message}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="text-muted d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" role="status" />
        <span>Загружаем клиентов…</span>
      </div>
    );
  }

  if (!clients.length) {
    return <div className="text-muted">По заданным критериям клиенты не найдены.</div>;
  }

  return (
    <Table responsive hover className="mb-0 align-middle">
      <thead>
        <tr>
          <th style={{ width: '10%' }}>ID</th>
          <th style={{ width: '30%' }}>E-mail</th>
          <th style={{ width: '20%' }}>Телефон</th>
          <th style={{ width: '15%' }} className="text-end">Общий баланс</th>
          <th style={{ width: '10%' }}>Статус</th>
          <th style={{ width: '15%' }}>Роль</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id}>
            <td>{client.id}</td>
            <td>{client.email}</td>
            <td>{client.phone}</td>
            <td className="text-end">{formatCurrency(client.totalBalance)}</td>
            <td>
              <Badge bg={statusVariants[client.status] ?? 'secondary'}>
                {statusLabels[client.status] ?? client.status}
              </Badge>
            </td>
            <td>{formatRole(client.role)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
