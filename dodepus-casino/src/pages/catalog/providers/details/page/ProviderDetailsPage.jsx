import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { games } from '../../../../../../data/games.js';

function GameThumb() {
  return (
    <div className="ratio ratio-16x9 rounded bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center border">
      <span className="text-muted">Preview</span>
    </div>
  );
}

export default function ProviderPage() {
  const { provider } = useParams(); // slug провайдера
  const list = useMemo(
    () => games.filter((g) => g.providerSlug === provider),
    [provider]
  );

  const providerName = list[0]?.provider || provider;

  if (list.length === 0) {
    return (
      <Alert variant="warning">
        У провайдера <strong>{provider}</strong> пока нет игр.{' '}
        <Button as={Link} to="/lobby" variant="link" className="p-0 align-baseline">
          В лобби
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Игры провайдера: {providerName}</h2>
        <Button as={Link} to="/lobby" variant="outline-secondary" size="sm">
          В лобби
        </Button>
      </div>

      <Row xs={1} sm={2} md={3} lg={4} className="g-3">
        {list.map((g) => (
          <Col key={g.id}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <GameThumb />
                <div className="mt-3">
                  <Card.Title className="mb-1">{g.title}</Card.Title>
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                    <Badge bg="light" text="dark">{g.provider}</Badge>
                    <Badge bg="secondary">{g.category}</Badge>
                    {g.rtp != null && <Badge bg="dark">RTP {g.rtp}%</Badge>}
                  </div>
                  <Card.Text className="text-muted small mb-3">
                    {g.description}
                  </Card.Text>
                </div>
                <div className="mt-auto d-flex justify-content-end">
                  <Button
                    as={Link}
                    to={`/game/${g.providerSlug}/${g.slug}`}
                    size="sm"
                    variant="primary"
                  >
                    Открыть
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
