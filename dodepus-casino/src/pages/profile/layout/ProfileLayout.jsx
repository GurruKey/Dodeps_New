import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { useVerificationModules } from '@/shared/verification';
import { useProfileRankSummary } from '../rank/hooks';
import { ProfileSidebarBlock } from './blocks';

export default function ProfileLayout() {
  const { user } = useAuth();
  const { summary: verificationSummary = {} } = useVerificationModules(user);

  const rankSummary = useProfileRankSummary();

  return (
    <Container>
      <Row className="g-4">
        <Col md={3}>
          <ProfileSidebarBlock
            user={user}
            verificationSummary={verificationSummary}
            rankSummary={rankSummary}
          />
        </Col>

        <Col md={9}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}
