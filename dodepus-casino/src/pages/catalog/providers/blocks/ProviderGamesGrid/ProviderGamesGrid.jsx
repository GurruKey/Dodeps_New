import PropTypes from 'prop-types';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { GameCover } from '@/shared/ui';

function DefaultMedia({ game }) {
  return (
    <GameCover
      providerSlug={game.providerSlug}
      slug={game.slug}
      alt={`${game.title} cover`}
    />
  );
}

DefaultMedia.propTypes = {
  game: PropTypes.shape({
    providerSlug: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

export default function ProviderGamesGrid({ providerName, games, renderMedia }) {
  const Media = renderMedia ?? DefaultMedia;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Игры провайдера: {providerName}</h2>
        <Button as={Link} to="/lobby" variant="outline-secondary" size="sm">
          В лобби
        </Button>
      </div>

      <Row xs={1} sm={2} md={3} lg={4} className="g-3">
        {games.map((game) => (
          <Col key={game.id}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <Media game={game} />
                <div className="mt-3">
                  <Card.Title className="mb-1">{game.title}</Card.Title>
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                    <Badge bg="light" text="dark">
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
                <div className="text-muted">Пока нет игр.</div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </>
  );
}

ProviderGamesGrid.propTypes = {
  providerName: PropTypes.string.isRequired,
  games: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      provider: PropTypes.string,
      providerSlug: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      category: PropTypes.string,
      description: PropTypes.string,
      rtp: PropTypes.number,
    })
  ).isRequired,
  renderMedia: PropTypes.func,
};

ProviderGamesGrid.defaultProps = {
  renderMedia: undefined,
};
