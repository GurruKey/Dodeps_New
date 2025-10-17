import { Card, Stack } from 'react-bootstrap';
import { renderEntries, renderPlaceholderItems } from './roleColumn/index.js';

export default function RoleColumn({ title, entries = [], isLoading }) {
  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column gap-3">
        <Card.Title className="text-center mb-0">{title}</Card.Title>
        {isLoading ? (
          <Stack gap={2} className="flex-grow-1">
            {renderPlaceholderItems()}
          </Stack>
        ) : (
          renderEntries(entries)
        )}
      </Card.Body>
    </Card>
  );
}
