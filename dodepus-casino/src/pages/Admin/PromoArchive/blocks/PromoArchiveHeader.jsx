import { Card, Button } from 'react-bootstrap';

export default function PromoArchiveHeader({ onReload, isLoading }) {
  return (
    <Card>
      <Card.Body className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
        <div>
          <Card.Title as="h3" className="mb-1">
            Архив Promo
          </Card.Title>
          <Card.Text className="text-muted mb-0">
            Здесь отображаются завершённые и отключённые промо-акции. Используйте архив для анализа
            прошедших кампаний и подготовки новых предложений.
          </Card.Text>
        </div>
        {onReload && (
          <Button variant="outline-primary" onClick={onReload} disabled={isLoading}>
            {isLoading ? 'Обновляем…' : 'Обновить данные'}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
