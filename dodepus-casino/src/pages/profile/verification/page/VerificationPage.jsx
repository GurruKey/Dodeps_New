import { Row, Col } from 'react-bootstrap';
import { ModuleStatusWidget } from '../widgets/ModuleStatusWidget.jsx';
import {
  EmailPhoneVerificationForm,
  PersonalDataVerificationForm,
  AddressVerificationForm,
  DocumentsVerificationForm,
} from '../forms/index.js';
import { VerificationHistory } from '../history/VerificationHistory.jsx';

export default function VerificationPage() {
  return (
    <div className="d-grid gap-4">
      <ModuleStatusWidget />
      <Row className="g-4">
        <Col lg={6} className="d-flex">
          <EmailPhoneVerificationForm />
        </Col>
        <Col lg={6} className="d-flex">
          <PersonalDataVerificationForm />
        </Col>
        <Col lg={6} className="d-flex">
          <AddressVerificationForm />
        </Col>
      </Row>
      <DocumentsVerificationForm />
      <VerificationHistory />
    </div>
  );
}
