import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button, ListGroup } from 'react-bootstrap';
import GameCover from '../../shared/ui/GameCover.jsx';

/**
 * Правый сайдбар страницы игры.
 * Props:
 * - game: { title, provider, providerSlug, category, rtp, volatility, description, tags, slug }
 * - recs: [] (массив похожих игр)
 */
function GameSidebar({ game, recs = [] }) {
  return (
    <>
      {/* Обложка игры */}
      <Card className="mb-3">
        <Card.Body>
          <GameCover
            providerSlug={game.providerSlug}
            slug={game.slug}
            alt={`${game.title} cover`}
          />
          {import.meta.env.DEV && (
            <div className="small text-body-secondary mt-2">
              Файлы ищутся как <code>cover/thumb/poster.(webp|png|jpg|jpeg|gif)</code> рядом с <code>index.html</code>.
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Описание */}
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Описание</Card.Title>
          <div className="d-flex flex-wrap gap-2 mb-2">
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
            {game.volatility && (
              <Badge bg="outline" className="border text-muted">
                {game.volatility}
              </Badge>
            )}
          </div>
          <Card.Text className="text-muted">{game.description}</Card.Text>
          {game.tags?.length > 0 && (
            <div className="d-flex gap-1 flex-wrap">
              {game.tags.map((t) => (
                <Badge key={t} bg="outline" className="border text-muted">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Провайдер */}
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Провайдер</Card.Title>
          <Card.Text className="mb-2">
            Игры от <strong>{game.provider}</strong>
          </Card.Text>
          <Button
            as={Link}
            to={`/providers/${game.providerSlug}`}
            size="sm"
            variant="outline-primary"
          >
            Игры провайдера
          </Button>
        </Card.Body>
      </Card>

      {/* Рекомендации */}
      <Card>
        <Card.Body>
          <Card.Title>Похожие игры</Card.Title>
          {recs.length > 0 ? (
            <ListGroup variant="flush">
              {recs.map((r) => (
                <ListGroup.Item key={r.id} className="px-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Link to={`/game/${r.providerSlug}/${r.slug}`}>{r.title}</Link>
                      <div className="small text-muted">
                        {r.provider} • {r.category} • RTP {r.rtp}%
                      </div>
                    </div>
                    <Button
                      as={Link}
                      to={`/game/${r.providerSlug}/${r.slug}`}
                      size="sm"
                      variant="outline-secondary"
                    >
                      Открыть
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-muted small">Пока нет рекомендаций.</div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

export default memo(GameSidebar);
