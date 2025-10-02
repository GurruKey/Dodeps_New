import { useCallback, useEffect, useState } from 'react';
import { Tab, Nav, Row, Col } from 'react-bootstrap';
import AdminOverview from './Admin/Overview.jsx';
import AdminManagement from './Admin/Management.jsx';
import { listClients } from '../../local-sim/admin/clients';

export default function Admin() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClients = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listClients(signal ? { signal } : undefined);
      if (!signal?.aborted) {
        setClients(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка загрузки клиентов'));
      setClients([]);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadClients(controller.signal);
    return () => controller.abort();
  }, [loadClients]);

  const handleReload = useCallback(() => {
    loadClients();
  }, [loadClients]);

  return (
    <>
      <h2 className="mb-3">Админ-панель</h2>

      <Tab.Container defaultActiveKey="overview">
        <Row className="g-3">
          <Col xs={12} md={3} lg={2}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item><Nav.Link eventKey="overview">Просмотр</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="management">Управление</Nav.Link></Nav.Item>
            </Nav>
          </Col>

          <Col xs={12} md={9} lg={10}>
            <Tab.Content>
              <Tab.Pane eventKey="overview">
                <AdminOverview clients={clients} isLoading={isLoading} error={error} />
              </Tab.Pane>
              <Tab.Pane eventKey="management">
                <AdminManagement
                  clients={clients}
                  isLoading={isLoading}
                  error={error}
                  onReload={handleReload}
                />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </>
  );
}
