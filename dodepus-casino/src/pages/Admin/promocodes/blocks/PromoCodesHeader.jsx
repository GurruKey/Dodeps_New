import { Card, Button } from 'react-bootstrap';

export default function PromoCodesHeader({ onReload, isLoading }) {
  return (
    <Card>
      <Card.Body className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
        <div>
          <Card.Title as="h3" className="mb-1">
            Управление промокодами
          </Card.Title>
          <Card.Text className="text-muted mb-0">
            Здесь появится синхронизация с реальным API. Пока используем демо-данные.
          </Card.Text>
        </div>
        {onReload && (
          <Button variant="outline-primary" onClick={onReload} disabled={isLoading}>
            Обновить данные
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
