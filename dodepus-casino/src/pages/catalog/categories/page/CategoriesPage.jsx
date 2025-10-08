import { useMemo } from 'react';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { games, categories } from '../../../../data/games.js';

function GameThumb() {
  return (
    <div className="ratio ratio-16x9 rounded bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center border">
      <span className="text-muted">Preview</span>
    </div>
  );
}

export default function CategoriesPage() {
  // Сгруппируем игры по категориям
  const byCat = useMemo(() => {
    const map = new Map();
    for (const c of categories) map.set(c, []);
    for (const g of games) {
      const arr = map.get(g.category) || [];
      arr.push(g);
      map.set(g.category, arr);
    }
    return map;
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Категории</h2>
        <Button as={Link} to="/lobby" variant="outline-secondary" size="sm">
          В лобби
        </Button>
      </div>

      {[...byCat.entries()].map(([cat, list]) => (
        <section key={cat} className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              {cat}{' '}
              <Badge bg="dark" className="align-middle">
                {list.length}
              </Badge>
            </h5>
            {/* Позже сделаем авто-фильтр лобби по ?cat=... */}
            <Button
              as={Link}
              to={`/lobby?cat=${encodeURIComponent(cat)}`}
              size="sm"
              variant="outline-primary"
            >
              Все игры категории
            </Button>
          </div>

          <Row xs={1} sm={2} md={3} lg={4} className="g-3">
            {list.slice(0, 8).map((g) => (
              <Col key={g.id}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column">
                    <GameThumb />
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
            {list.length === 0 && (
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
      ))}
    </>
  );
}
