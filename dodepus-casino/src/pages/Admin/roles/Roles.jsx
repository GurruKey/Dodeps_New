import { Card, Col, Row, Stack } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import RolesMatrix from './blocks/RolesMatrix.jsx';
import AssignRole from './blocks/AssignRole/AssignRole.jsx';
import EditRolePermissions from './blocks/EditRole/EditRolePermissions.jsx';
import TransactionsHistory from './blocks/Transactions/TransactionsHistory.jsx';
import VerificationQueue from './blocks/Verification/VerificationQueue.jsx';
import ModerationChat from './blocks/Chat/ModerationChat.jsx';

export default function Roles() {
  const { isLoading } = useOutletContext() ?? {};

  return (
    <Stack gap={3}>
      <Card>
        <Card.Body>
          <Card.Title as="h3" className="mb-1">
            Роли и права доступа
          </Card.Title>
          <Card.Text className="text-muted mb-0">
            Управление доступом сотрудников к разделам панели. {isLoading ? 'Синхронизация с данными выполняется…' : ''}
          </Card.Text>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col xs={12} xl={6}>
          <AssignRole />
        </Col>
        <Col xs={12} xl={6}>
          <EditRolePermissions />
        </Col>
      </Row>

      <RolesMatrix />

      <Row className="g-3">
        <Col xs={12} xxl={6}>
          <TransactionsHistory />
        </Col>
        <Col xs={12} xxl={6}>
          <VerificationQueue />
        </Col>
      </Row>

      <ModerationChat />
    </Stack>
  );
}
