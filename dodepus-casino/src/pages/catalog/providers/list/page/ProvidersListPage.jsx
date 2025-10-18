import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ProvidersDirectory } from '@/pages/catalog/providers/blocks';
import { useProvidersDirectory } from '@/pages/catalog/providers/hooks';

export default function ProvidersListPage() {
  const providers = useProvidersDirectory();

  if (providers.length === 0) {
    return (
      <Alert variant="info">
        Провайдеров пока нет.{' '}
        <Button as={Link} to="/lobby" variant="link" className="p-0 align-baseline">
          В лобби
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Провайдеры</h2>
        <Button as={Link} to="/lobby" variant="outline-secondary" size="sm">
          В лобби
        </Button>
      </div>

      <ProvidersDirectory providers={providers} />
    </>
  );
}
