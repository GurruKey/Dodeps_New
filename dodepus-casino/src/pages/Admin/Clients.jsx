import { useEffect, useMemo, useState } from 'react';
import { Alert, Card, Stack } from 'react-bootstrap';
import ClientSearchFilters from './clients/ClientSearchFilters.jsx';
import ClientsTable from './clients/ClientsTable.jsx';
import ClientStats from './clients/ClientStats.jsx';

function normalize(value) {
  return String(value ?? '')
    .replace(/\s+/g, '')
    .replace(/[-()]/g, '')
    .toLowerCase();
}

export default function AdminClients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [clientsData, setClientsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const sourceUrl = `${import.meta.env.BASE_URL}admin/clients.json`;

    async function loadClients() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(sourceUrl);
        if (!response.ok) {
          throw new Error(`Не удалось загрузить клиентов (HTTP ${response.status})`);
        }

        const data = await response.json();
        if (!cancelled) {
          setClientsData(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Неизвестная ошибка загрузки клиентов'));
          setClientsData([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadClients();

    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    const totalBalance = clientsData.reduce((sum, client) => sum + client.totalBalance, 0);
    return {
      totalClients: clientsData.length,
      totalBalance,
    };
  }, [clientsData]);

  const filteredClients = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);

    return clientsData.filter((client) => {
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
  }, [balanceFilter, roleFilter, searchTerm, statusFilter, clientsData]);

  const filteredBalance = useMemo(
    () => filteredClients.reduce((sum, client) => sum + client.totalBalance, 0),
    [filteredClients],
  );

  return (
    <Stack gap={3}>
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
