import { Card, Col, Row, Stack } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import RolesMatrix from './blocks/RolesMatrix.jsx';
import AssignRole from './blocks/AssignRole/AssignRole.jsx';

export default function Roles() {
  const { isLoading } = useOutletContext() ?? {};

  return (
    <Stack gap={3}>
      <Card>
        <Card.Body>
          <Card.Title as="h3" className="mb-1">
            Выдать роль
          </Card.Title>
          <Card.Text className="text-muted mb-0">
            Назначьте сотруднику подходящую роль и проверьте доступы. {isLoading ? 'Синхронизация с данными выполняется…' : ''}
          </Card.Text>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col xs={12} xl={6}>
          <AssignRole />
        </Col>
        <Col xs={12} xl={6}>
          <RolesMatrix />
        </Col>
      </Row>
    </Stack>
  );
}
