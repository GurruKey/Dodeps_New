import { useMemo } from 'react';
import { Alert, Card, Col, Row, Stack } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import StatCard from './blocks/StatCard.jsx';
import TopClientsList from './blocks/TopClientsList.jsx';

export default function AdminOverview() {
  const { clients = [], isLoading, error } = useOutletContext() ?? {};

  const stats = useMemo(() => {
    if (!clients.length) {
      return {
        totalClients: 0,
        positiveBalance: 0,
        negativeBalance: 0,
        totalBalance: 0,
        averageBalance: 0,
      };
    }

    const totalBalance = clients.reduce((sum, client) => sum + client.totalBalance, 0);
    const positiveBalance = clients.filter((client) => client.totalBalance > 0).length;
    const negativeBalance = clients.filter((client) => client.totalBalance < 0).length;

    return {
      totalClients: clients.length,
      positiveBalance,
      negativeBalance,
      totalBalance,
      averageBalance: Math.round(totalBalance / clients.length),
    };
  }, [clients]);

  const topClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => b.totalBalance - a.totalBalance)
      .slice(0, 5);
  }, [clients]);

  return (
    <Stack gap={3}>
      <Card>
        <Card.Body>
          <Card.Title as="h3" className="mb-1">
            Просмотр аудитории
          </Card.Title>
          <Card.Text className="text-muted mb-0">
            Краткий обзор ключевых показателей базы клиентов и самых активных пользователей.
          </Card.Text>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-0">
          Не удалось получить данные для обзора: {error.message}
        </Alert>
      )}

      <Row className="g-3">
        <Col xs={12} md={6} xl={3}>
          <StatCard title="Всего клиентов" value={stats.totalClients} isLoading={isLoading} />
        </Col>
        <Col xs={12} md={6} xl={3}>
          <StatCard title="Положительный баланс" value={stats.positiveBalance} isLoading={isLoading} />
        </Col>
        <Col xs={12} md={6} xl={3}>
          <StatCard title="Отрицательный баланс" value={stats.negativeBalance} isLoading={isLoading} />
        </Col>
        <Col xs={12} md={6} xl={3}>
          <StatCard
            title="Средний баланс"
            value={new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(stats.averageBalance)}
            isLoading={isLoading}
          />
        </Col>
      </Row>

      <TopClientsList clients={topClients} isLoading={isLoading} />
    </Stack>
  );
}
