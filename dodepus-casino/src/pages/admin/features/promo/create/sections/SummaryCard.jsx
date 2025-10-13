import { Badge, Card, ListGroup } from 'react-bootstrap';

const getStatusLabel = (statusOptions, value) => {
  const match = statusOptions.find((option) => option.value === value);
  return match?.label ?? value;
};

export default function SummaryCard({ groups = [], statusOptions = [] }) {
  const visibleGroups = groups.filter((group) => Array.isArray(group.items) && group.items.length > 0);
  const hasItems = visibleGroups.length > 0;

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h5" className="mb-3">
          Сводка промокода
        </Card.Title>
        {hasItems ? (
          visibleGroups.map((group, index) => {
            const isLast = index === visibleGroups.length - 1;

            return (
              <div key={group.title} className={isLast ? '' : 'mb-4'}>
                <div className="text-uppercase text-muted small fw-semibold mb-2">{group.title}</div>
                <ListGroup variant="flush">
                  {group.items.map((item) => (
                    <ListGroup.Item key={`${group.title}-${item.label}`} className="px-0 py-2">
                      <div className="text-muted small mb-1">{item.label}</div>
                      <div className="fw-semibold">
                        {item.kind === 'status' ? (
                          <Badge bg="secondary" className="text-uppercase fw-semibold">
                            {getStatusLabel(statusOptions, item.value)}
                          </Badge>
                        ) : (
                          item.value
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            );
          })
        ) : (
          <Card.Text className="text-muted mb-0">
            Заполните параметры, и мы сформируем сводку автоматически.
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
}
