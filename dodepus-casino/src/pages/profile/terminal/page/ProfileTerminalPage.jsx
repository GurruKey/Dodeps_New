import { Row, Col } from 'react-bootstrap';
import { ProfileBlocksLayout } from '@/pages/profile/layout/blocks';
import { DepositBlock, WithdrawBlock } from '../blocks';

export default function ProfileTerminalPage() {
  return (
    <ProfileBlocksLayout>
      <Row className="g-3 flex-row-reverse">
        <Col md={6}>
          <DepositBlock />
        </Col>
        <Col md={6}>
          <WithdrawBlock />
        </Col>
      </Row>
    </ProfileBlocksLayout>
  );
}
