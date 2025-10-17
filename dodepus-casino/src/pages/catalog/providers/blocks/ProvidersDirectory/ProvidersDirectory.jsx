import PropTypes from 'prop-types';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function ProvidersDirectory({ providers }) {
  if (providers.length === 0) {
    return (
      <Card className="border-0 surface-card">
        <Card.Body>
          <div className="text-muted">Пока нет провайдеров.</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Row xs={1} sm={2} md={3} className="g-3">
      {providers.map((provider) => (
        <Col key={provider.slug}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <Card.Title className="mb-1">{provider.name}</Card.Title>
                  <div className="text-muted small">{provider.total} игр в каталоге</div>
                </div>
                <Badge bg="dark">{provider.total}</Badge>
              </div>

              {provider.samples.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {provider.samples.map((game) => (
                    <Badge key={game.id} bg="secondary" className="text-wrap">
                      {game.title}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-auto d-flex justify-content-end">
                <Button
                  as={Link}
                  to={`/providers/${provider.slug}`}
                  size="sm"
                  variant="outline-primary"
                >
                  Игры провайдера
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

ProvidersDirectory.propTypes = {
  providers: PropTypes.arrayOf(
    PropTypes.shape({
      slug: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
      samples: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};
