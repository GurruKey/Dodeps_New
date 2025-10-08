import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import GameCanvas from '../GameCanvas.jsx';
import GameSidebar from '../GameSidebar.jsx';
import useGameData from '../useGameData.js';

export default function Game() {
  const { game, recs, providerSlug, gameSlug, notFound } = useGameData();

  if (notFound) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Игра не найдена</Card.Title>
          <Card.Text className="text-muted">
            Проверь маршрут <code>/game/&lt;provider&gt;/&lt;slug&gt;</code> и фикстуру в <code>src/data/games.js</code>.
          </Card.Text>
          <Button as={Link} to="/lobby" variant="primary">В лобби</Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Row className="g-4">
      {/* Холст игры */}
      <Col md={8} lg={9}>
        <Card className="h-100">
          <Card.Body>
            <GameCanvas
              providerSlug={providerSlug}
              gameSlug={gameSlug}
              title={game.title}
              providerName={game.provider}
            />
          </Card.Body>
        </Card>
      </Col>

      {/* Правый сайдбар */}
      <Col md={4} lg={3}>
        <GameSidebar game={game} recs={recs} />
      </Col>
    </Row>
  );
}
