import { useMemo, useState } from 'react';
import { Alert, Button, Card, Stack } from 'react-bootstrap';
import ClientSearchFilters from './clients/ClientSearchFilters.jsx';
import ClientsTable from './clients/ClientsTable.jsx';
import ClientStats from './clients/ClientStats.jsx';

function normalize(value) {
  return String(value ?? '')
    .replace(/\s+/g, '')
    .replace(/[-()]/g, '')
    .toLowerCase();
}

export default function AdminManagement({ clients = [], isLoading, error, onReload }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const totals = useMemo(() => {
    const totalBalance = clients.reduce((sum, client) => sum + client.totalBalance, 0);
    return {
      totalClients: clients.length,
      totalBalance,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);

    return clients.filter((client) => {
      const matchesSearch = normalizedSearch
        ? [client.id, client.email, client.phone].some((field) =>
            normalize(String(field)).includes(normalizedSearch),
          )
        : true;

      const matchesStatus = statusFilter === 'all' ? true : client.status === statusFilter;

      const matchesRole = (() => {
        if (roleFilter === 'all') return true;
        const [group, level] = roleFilter.split(':');
        if (!client.role) return false;
        if (level) {
          return client.role.group === group && String(client.role.level ?? '') === level;
        }
        return client.role.group === group;
      })();

      const matchesBalance = (() => {
        if (balanceFilter === 'all') return true;
        if (balanceFilter === 'positive') return client.totalBalance > 0;
        if (balanceFilter === 'zero') return client.totalBalance === 0;
        if (balanceFilter === 'negative') return client.totalBalance < 0;
        return true;
      })();

      return matchesSearch && matchesStatus && matchesRole && matchesBalance;
    });
  }, [balanceFilter, roleFilter, searchTerm, statusFilter, clients]);

  const filteredBalance = useMemo(
    () => filteredClients.reduce((sum, client) => sum + client.totalBalance, 0),
    [filteredClients],
  );

  return (
    <Stack gap={3}>
      <Card>
        <Card.Body>
          <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
            <div>
              <Card.Title as="h3" className="mb-1">
                Управление клиентами
              </Card.Title>
              <Card.Text className="text-muted mb-0">
                Настраивайте фильтры, чтобы быстро находить нужных пользователей и анализировать их
                активность.
              </Card.Text>
            </div>
            {onReload && (
              <Button variant="outline-primary" onClick={onReload} disabled={isLoading}>
                Обновить данные
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Поиск и фильтры</Card.Title>
          <ClientSearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            balanceFilter={balanceFilter}
            onBalanceChange={setBalanceFilter}
            roleFilter={roleFilter}
            onRoleChange={setRoleFilter}
          />
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-0">
          Не удалось загрузить список клиентов: {error.message}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Card.Title>Статистика</Card.Title>
          <ClientStats
            totalClients={totals.totalClients}
            filteredClients={filteredClients.length}
            totalBalance={totals.totalBalance}
            filteredBalance={filteredBalance}
            isLoading={isLoading}
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Список клиентов</Card.Title>
          <ClientsTable clients={filteredClients} isLoading={isLoading} error={error} />
        </Card.Body>
      </Card>
    </Stack>
  );
}
