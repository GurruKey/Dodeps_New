import { useMemo, useState } from 'react';
import { Card, Stack } from 'react-bootstrap';
import clientsData from '../../data/clients.js';
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

  const totals = useMemo(() => {
    const totalBalance = clientsData.reduce((sum, client) => sum + client.totalBalance, 0);
    return {
      totalClients: clientsData.length,
      totalBalance,
    };
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);

    return clientsData.filter((client) => {
      const matchesSearch = normalizedSearch
        ? [client.id, client.email, client.phone].some((field) =>
            normalize(String(field)).includes(normalizedSearch),
          )
        : true;

      const matchesStatus = statusFilter === 'all' ? true : client.status === statusFilter;

      const matchesBalance = (() => {
        if (balanceFilter === 'all') return true;
        if (balanceFilter === 'positive') return client.totalBalance > 0;
        if (balanceFilter === 'zero') return client.totalBalance === 0;
        if (balanceFilter === 'negative') return client.totalBalance < 0;
        return true;
      })();

      return matchesSearch && matchesStatus && matchesBalance;
    });
  }, [balanceFilter, searchTerm, statusFilter]);

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
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Статистика</Card.Title>
          <ClientStats
            totalClients={totals.totalClients}
            filteredClients={filteredClients.length}
            totalBalance={totals.totalBalance}
            filteredBalance={filteredBalance}
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Список клиентов</Card.Title>
          <ClientsTable clients={filteredClients} />
        </Card.Body>
      </Card>
    </Stack>
  );
}
