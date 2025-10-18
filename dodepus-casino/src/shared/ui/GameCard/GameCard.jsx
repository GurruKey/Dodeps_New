import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { GameCover } from '../GameCover';

/**
 * Карточка игры: обложка + оверлей на hover, снизу название и провайдер.
 * Props: game { title, provider, providerSlug, slug }
 */
export default function GameCard({ game }) {
  const to = `/game/${game.providerSlug}/${game.slug}`;

  return (
    <Card className="game-card h-100 border-0 bg-transparent">
      {/* Обложка */}
      <div className="game-card-thumb">
        <GameCover
          providerSlug={game.providerSlug}
          slug={game.slug}
          alt={`${game.title} cover`}
        />

        {/* Оверлей на hover */}
        <div className="game-card-overlay">
          <Button as={Link} to={to} variant="warning" size="sm" className="fw-semibold px-3 py-2">
            Играть сейчас
          </Button>
        </div>
      </div>

      {/* Низ карточки */}
      <div className="game-card-meta">
        <div className="game-card-title text-truncate">{game.title}</div>
        <div className="game-card-sub text-muted text-truncate">{game.provider}</div>
      </div>
    </Card>
  );
}
