import { Button, Card, Stack } from 'react-bootstrap';

export default function RankEditorIntro({ onReset, onReload, isResetting, isLoading }) {
  return (
    <Card className="border-0 surface-card">
      <Card.Body>
        <Stack gap={3}>
          <div>
            <Card.Title as="h3" className="mb-2">
              Ранг редактор
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Управляйте описаниями VIP уровней, цветами бейджей и целями уровней. Изменения сохраняются в
              local-sim и сразу доступны в профиле игроков.
            </Card.Text>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Button variant="outline-secondary" onClick={onReload} disabled={isLoading}>
              {isLoading ? 'Обновляем…' : 'Обновить данные'}
            </Button>
            <Button variant="outline-danger" onClick={onReset} disabled={isResetting || isLoading}>
              {isResetting ? 'Сбрасываем…' : 'Сбросить к стандартным значениям'}
            </Button>
          </div>
        </Stack>
      </Card.Body>
    </Card>
  );
}
