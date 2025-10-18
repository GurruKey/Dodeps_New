import { Alert, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { ProviderGamesGrid } from '@/pages/catalog/providers/blocks';
import { useProviderGames } from '@/pages/catalog/providers/hooks';

export default function ProviderDetailsPage() {
  const { provider: providerSlug } = useParams();
  const { games, providerName } = useProviderGames(providerSlug);

  if (!providerSlug) {
    return (
      <Alert variant="danger">
        Не указан провайдер.{' '}
        <Button as={Link} to="/providers" variant="link" className="p-0 align-baseline">
          Все провайдеры
        </Button>
      </Alert>
    );
  }

  if (games.length === 0) {
    return (
      <Alert variant="warning">
        У провайдера <strong>{providerSlug}</strong> пока нет игр.{' '}
        <Button as={Link} to="/providers" variant="link" className="p-0 align-baseline">
          Назад к списку
        </Button>
      </Alert>
    );
  }

  return <ProviderGamesGrid providerName={providerName} games={games} />;
}
