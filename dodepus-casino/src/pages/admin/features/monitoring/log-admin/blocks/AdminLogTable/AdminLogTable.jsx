import { Alert, Badge, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import {
  getAdminLogRoleLabel,
  getAdminLogSectionLabel,
} from '../../../../../../../../local-sim/modules/logs/index.js';

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

export default function AdminLogTable({ logs, loading, error }) {
  const hasLogs = Array.isArray(logs) && logs.length > 0;

  return (
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
        ) : hasLogs ? (
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
                {logs.map((log) => (
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
  );
}
