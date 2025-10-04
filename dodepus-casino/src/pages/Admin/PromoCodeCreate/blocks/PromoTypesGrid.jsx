import { Col, Row } from 'react-bootstrap';
import { promoTypeDefinitions } from '../../../../../local-sim/admin/promocodes/definitions';
import PromoTypeCard from './PromoTypeCard.jsx';

export default function PromoTypesGrid({ selectedTypeId, onSelect }) {
  return (
    <Row className="g-3" role="list">
      {promoTypeDefinitions.map((type) => (
        <Col key={type.id} xs={12} md={6} xl={4} role="listitem">
          <PromoTypeCard type={type} selected={type.id === selectedTypeId} onSelect={onSelect} />
        </Col>
      ))}
    </Row>
  );
}
