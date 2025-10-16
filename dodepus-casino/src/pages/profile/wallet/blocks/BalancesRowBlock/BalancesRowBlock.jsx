import { Col, Row } from 'react-bootstrap';
import RealBalanceBlock from '../RealBalanceBlock';
import WithdrawableBlock from '../WithdrawableBlock';

export default function BalancesRowBlock() {
  return (
    <Row className="g-3">
      <Col md={6}>
        <RealBalanceBlock />
      </Col>
      <Col md={6}>
        <WithdrawableBlock />
      </Col>
    </Row>
  );
}
