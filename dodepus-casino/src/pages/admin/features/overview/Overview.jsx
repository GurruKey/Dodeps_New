import { Alert, Col, Row, Stack } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import { RoleColumn, StatCard } from './components/index.js';
import { ROLE_COLUMNS } from './constants/index.js';
import {
  useGroupedRoles,
  useNewClients,
  useTotalClients,
} from './hooks/index.js';

export default function AdminOverview() {
  const { clients = [], isLoading, error } = useOutletContext() ?? {};

  const totalClients = useTotalClients(clients);
  const newClients = useNewClients(clients);
  const groupedRoles = useGroupedRoles(clients);

  return (
    <Stack gap={3}>
      {error && (
        <Alert variant="danger" className="mb-0">
          Не удалось получить данные для обзора: {error.message}
        </Alert>
      )}

      <Row className="g-3">
        <Col xs={12} md={6} xl={6}>
          <StatCard title="Клиенты" value={totalClients} isLoading={isLoading} />
        </Col>
        <Col xs={12} md={6} xl={6}>
          <StatCard title="Новые клиенты за неделю" value={newClients} isLoading={isLoading} />
        </Col>
      </Row>

      <Row className="g-3">
        {ROLE_COLUMNS.map(({ key, title }) => (
          <Col xs={12} md={4} key={key}>
            <RoleColumn title={title} entries={groupedRoles[key] ?? []} isLoading={isLoading} />
          </Col>
        ))}
      </Row>
    </Stack>
  );
}
