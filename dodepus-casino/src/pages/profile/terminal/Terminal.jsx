import { Row, Col } from 'react-bootstrap';
import { DepositBlock, WithdrawBlock } from './blocks';

export default function Terminal() {
  return (
    <div className="d-flex flex-column gap-3">
      {/* Справа → налево: сначала рендерим депозит, но разворачиваем ряд */}
      <Row className="g-3 flex-row-reverse">
        <Col md={6}>
          <DepositBlock />
        </Col>
        <Col md={6}>
          <WithdrawBlock />
        </Col>
      </Row>
    </div>
  );
}
