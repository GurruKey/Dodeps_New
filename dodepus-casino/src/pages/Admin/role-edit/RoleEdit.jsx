import { Col, Row, Stack } from 'react-bootstrap';
import EditRolePermissions from '../roles/blocks/EditRole/EditRolePermissions.jsx';
import TransactionsHistory from '../roles/blocks/Transactions/TransactionsHistory.jsx';
import VerificationQueue from '../roles/blocks/Verification/VerificationQueue.jsx';
import ModerationChat from '../roles/blocks/Chat/ModerationChat.jsx';

export default function RoleEdit() {
  return (
    <Stack gap={3}>
      <EditRolePermissions />

      <Row xs={1} xl={2} className="g-3">
        <Col>
          <TransactionsHistory />
        </Col>
        <Col>
          <VerificationQueue />
        </Col>
      </Row>

      <ModerationChat />
    </Stack>
  );
}
