import { Container, Row, Col, Nav, Badge } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../../app/providers';
import { useVerificationModules } from '../../../shared/verification/index.js';
import { useProfileRankSummary } from '../rank/hooks/useProfileRankSummary.js';
import { normalizeHexColor, resolveAutoTextColor } from '../../../shared/rank/badgeEffects.js';

const DEFAULT_BADGE_COLOR = '#adb5bd';

const pickBadgeColor = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }
  return normalizeHexColor(value, DEFAULT_BADGE_COLOR);
};

export default function ProfileLayout() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const balance = user?.balance ?? 0;
  const { summary: verificationSummary = {} } = useVerificationModules(user);

  const rankSummary = useProfileRankSummary();
  const rankBadgeLabel =
    rankSummary?.currentLevel?.shortLabel ||
    rankSummary?.currentLevel?.label ||
    'VIP 0';
  const badgeColor = pickBadgeColor(rankSummary?.currentLevel?.badgeColor);
  const badgeTextColor = normalizeHexColor(
    rankSummary?.currentLevel?.badgeTextColor,
    resolveAutoTextColor(badgeColor ?? DEFAULT_BADGE_COLOR),
  );
  const rankBadgeVariant = badgeColor
    ? null
    : rankSummary?.currentLevel?.level >= 5
      ? 'warning'
      : 'secondary';
  const rankBadgeStyle = badgeColor
    ? {
        backgroundColor: badgeColor,
        color: badgeTextColor,
        border: '1px solid rgba(0, 0, 0, 0.1)',
      }
    : undefined;

  const verificationApproved = Number.isFinite(verificationSummary?.approved)
    ? verificationSummary.approved
    : 0;
  const verificationTotal = Number.isFinite(verificationSummary?.total)
    ? verificationSummary.total
    : 4;
  const verificationBadgeVariant = verificationSummary?.hasRejected
    ? 'danger'
    : verificationSummary?.hasPending
      ? 'warning'
      : verificationSummary?.allApproved
        ? 'success'
        : 'secondary';
  const verificationLabelClass = verificationSummary?.hasRejected
    ? 'text-danger fw-semibold'
    : verificationSummary?.hasPending
      ? 'text-warning fw-semibold'
      : verificationSummary?.allApproved
        ? 'text-success'
        : '';

  const fmt = (v) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(v);

  return (
    <Container>
      <Row className="g-4">
        <Col md={3}>
          <div className="profile-sidebar">
            <Nav variant="pills" className="flex-column gap-1">
              {/* БАЛАНС */}
              <Nav.Link
                as={NavLink}
                to="wallet"
                className="d-flex justify-content-between align-items-center"
              >
                <span>Баланс</span>
                <Badge bg="secondary">{fmt(balance)}</Badge>
              </Nav.Link>

              {/* ИСТОРИЯ ТРАНЗАКЦИЙ */}
              <Nav.Link as={NavLink} to="history">
                История транзакций
              </Nav.Link>

              {/* ТЕРМИНАЛ */}
              <Nav.Link as={NavLink} to="terminal">
                Терминал
              </Nav.Link>

              {/* разделитель */}
              <div className="my-2 border-top border-secondary" style={{ opacity: 0.5 }} />

              {/* ПЕРСОНАЛЬНЫЕ ДАННЫЕ */}
              <Nav.Link as={NavLink} end to="personal">
                Персональные данные
              </Nav.Link>

              <Nav.Link
                as={NavLink}
                to="verification"
                className="d-flex justify-content-between align-items-center"
              >
                <span className={verificationLabelClass.trim() || undefined}>
                  Верификация
                </span>
                <Badge bg={verificationBadgeVariant}>
                  {verificationApproved} / {verificationTotal}
                </Badge>
              </Nav.Link>

              {/* разделитель */}
              <div className="my-2 border-top border-secondary" style={{ opacity: 0.5 }} />

              <Nav.Link
                as={NavLink}
                to="rank"
                className="d-flex justify-content-between align-items-center"
              >
                <span>Ранг</span>
                <Badge bg={rankBadgeVariant ?? 'secondary'} style={rankBadgeStyle}>
                  {rankBadgeLabel}
                </Badge>
              </Nav.Link>

              {/* АКЦИИ / СЕЗОН */}
              <Nav.Link as={NavLink} to="promos">
                Акции для игры
              </Nav.Link>
              <Nav.Link as={NavLink} to="season">
                Сезон
              </Nav.Link>

              {/* разделитель */}
              <div className="my-2 border-top border-secondary" style={{ opacity: 0.5 }} />

              {/* ИСТОРИЯ ИГР */}
              <Nav.Link as={NavLink} to="games-history">
                История игр
              </Nav.Link>
            </Nav>
          </div>
        </Col>

        <Col md={9}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}
