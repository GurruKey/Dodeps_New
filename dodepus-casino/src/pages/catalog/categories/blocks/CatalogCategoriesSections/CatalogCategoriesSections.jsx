import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function GameThumb() {
  return (
    <div className="ratio ratio-16x9 rounded bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center border">
      <span className="text-muted">Preview</span>
    </div>
  );
}

export default function CatalogCategoriesSections({ categories }) {
  return categories.map(({ name, games, total }) => (
    <section key={name} className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">
          {name}{' '}
          <Badge bg="dark" className="align-middle">
            {total}
          </Badge>
        </h5>
        <Button
          as={Link}
          to={`/lobby?cat=${encodeURIComponent(name)}`}
          size="sm"
          variant="outline-primary"
        >
          Все игры категории
        </Button>
      </div>

      <Row xs={1} sm={2} md={3} lg={4} className="g-3">
        {games.slice(0, 8).map((game) => (
          <Col key={game.id}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <GameThumb />
                <div className="mt-3">
                  <Card.Title className="mb-1">{game.title}</Card.Title>
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                    <Badge
                      bg="light"
                      text="dark"
                      as={Link}
                      to={`/providers/${game.providerSlug}`}
                      className="text-decoration-none text-reset"
                    >
                      {game.provider}
                    </Badge>
                    <Badge bg="secondary">{game.category}</Badge>
                    {game.rtp != null && <Badge bg="dark">RTP {game.rtp}%</Badge>}
                  </div>
                  <Card.Text className="text-muted small mb-3">{game.description}</Card.Text>
                </div>
                <div className="mt-auto d-flex justify-content-end">
                  <Button
                    as={Link}
                    to={`/game/${game.providerSlug}/${game.slug}`}
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
        {games.length === 0 && (
          <Col>
            <Card className="border-0 surface-card">
              <Card.Body>
                <div className="text-muted">Пока пусто.</div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </section>
  ));
}
