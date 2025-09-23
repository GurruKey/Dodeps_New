import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { games, categories } from '../data/games.js';
import GameCover from '../shared/ui/GameCover.jsx';

export default function Home() {
  const top = games.slice(0, 6);

  return (
    <>
      <h5 className="mb-2">Категории</h5>
      <div className="d-flex flex-wrap gap-2 mb-4">
        {categories.map((c) => (
          <Badge key={c} bg="secondary">{c}</Badge>
        ))}
      </div>

      <h5 className="mb-3">Популярное</h5>
      <Row xs={1} sm={2} md={3} lg={4} className="g-3">
        {top.map((g) => (
          <Col key={g.id}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <GameCover
                  providerSlug={g.providerSlug}
                  slug={g.slug}
                  alt={`${g.title} cover`}
                />

                <div className="mt-3">
                  <Card.Title className="mb-1">{g.title}</Card.Title>
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                    <Badge
                      bg="light"
                      text="dark"
                      as={Link}
                      to={`/providers/${g.providerSlug}`}
                      className="text-decoration-none text-reset"
                    >
                      {g.provider}
                    </Badge>
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
