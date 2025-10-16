import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Stack,
  Table,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import {
  getAdminLogRoleLabel,
  getAdminLogRoleOptions,
  getAdminLogSectionLabel,
  getAdminLogSections,
  listAdminLogs,
} from '../../../../../../local-sim/modules/logs/index.js';

const formatDateTime = (value) => {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const normalizeSearch = (value) => value.trim().toLowerCase();

export default function AdminLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [section, setSection] = useState('all');
  const [role, setRole] = useState('all');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    listAdminLogs({ signal: controller.signal })
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error('Не удалось получить логи'));
        setLogs([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const sectionOptions = useMemo(() => {
    return [{ value: 'all', label: 'Все вкладки' }, ...getAdminLogSections()];
  }, []);

  const roleOptions = useMemo(() => {
    return [{ value: 'all', label: 'Все роли' }, ...getAdminLogRoleOptions()];
  }, []);

  const filteredLogs = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return logs.filter((log) => {
      const matchesId = !normalizedSearch || normalizeSearch(log.id).includes(normalizedSearch);
      const matchesSection = section === 'all' || log.section === section;
      const matchesRole = role === 'all' || log.role === role;
      return matchesId && matchesSection && matchesRole;
    });
  }, [logs, role, search, section]);

  return (
    <Stack gap={3}>
      <Card>
        <Card.Body>
          <Card.Title as="h3" className="mb-3">
            Log Admin
          </Card.Title>
          <Card.Text className="text-muted mb-4">
            Поиск действий администраторов по идентификатору, вкладке и роли.
          </Card.Text>

          <Stack gap={3}>
            <Form.Group controlId="admin-log-search">
              <Form.Label>Поиск по ID</Form.Label>
              <Form.Control
                type="search"
                placeholder="Введите идентификатор лога"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Form.Group>

            <div>
              <Form.Label className="d-block mb-2">Фильтр по вкладкам</Form.Label>
              <ToggleButtonGroup
                type="radio"
                name="admin-log-section"
                value={section}
                onChange={(value) => setSection(value)}
              >
                {sectionOptions.map((option) => (
                  <ToggleButton
                    key={option.value}
                    id={`admin-log-section-${option.value}`}
                    value={option.value}
                    variant={section === option.value ? 'primary' : 'outline-primary'}
                  >
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>

            <div>
              <Form.Label className="d-block mb-2">Фильтр по ролям</Form.Label>
              <ToggleButtonGroup
                type="radio"
                name="admin-log-role"
                value={role}
                onChange={(value) => setRole(value)}
              >
                {roleOptions.map((option) => (
                  <ToggleButton
                    key={option.value}
                    id={`admin-log-role-${option.value}`}
                    value={option.value}
                    variant={role === option.value ? 'secondary' : 'outline-secondary'}
                  >
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
          </Stack>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title as="h3" className="mb-3">
            Все события
          </Card.Title>
          <Card.Text className="text-muted mb-4">
            Лента действий администраторов по всем вкладкам панели управления.
          </Card.Text>

          {error && (
            <Alert variant="danger" className="mb-4">
              Не удалось загрузить логи: {error.message}
            </Alert>
          )}

          {loading ? (
            <div className="py-5 text-center">
              <Spinner animation="border" role="status" aria-hidden="true" className="mb-2" />
              <div className="text-muted">Загрузка логов…</div>
            </div>
          ) : filteredLogs.length ? (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Администратор</th>
                    <th>Роль</th>
                    <th>Вкладка</th>
                    <th>Действие</th>
                    <th>Дата и время</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="fw-medium">{log.id}</td>
                      <td>
                        <div className="fw-semibold">{log.adminName}</div>
                        <div className="text-muted small">{log.adminId}</div>
                      </td>
                      <td>
                        <Badge bg="secondary">{getAdminLogRoleLabel(log.role)}</Badge>
                      </td>
                      <td>{getAdminLogSectionLabel(log.section)}</td>
                      <td>{log.action}</td>
                      <td>{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Row>
              <Col>
                <div className="py-5 text-center text-muted">Нет логов по выбранным условиям.</div>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </Stack>
  );
}

