import { Badge, Card, ListGroup } from 'react-bootstrap';

const DEFAULT_COLOR = '#adb5bd';

const normalizeColor = (value) => {
  if (typeof value !== 'string') {
    return DEFAULT_COLOR;
  }
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return DEFAULT_COLOR;
  }
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return /^#([0-9a-f]{6})$/.test(normalized) ? normalized : DEFAULT_COLOR;
};

const resolveBadgeTextColor = (hexColor) => {
  const hex = normalizeColor(hexColor).replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return '#fff';
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? '#212529' : '#fff';
};

const composeTitle = (reward) => {
  const tagline = typeof reward?.tagline === 'string' ? reward.tagline.trim() : '';
  if (tagline) {
    return `${reward.label} — ${tagline}`;
  }
  if (typeof reward?.title === 'string' && reward.title.trim()) {
    return reward.title;
  }
  return reward?.label ?? 'VIP';
};

export default function RankRewardsList({ rewards }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Награды за ранги</Card.Title>
        <div className="text-muted mb-3">
          Получайте дополнительные бонусы и сервис, достигая новых уровней VIP.
        </div>
        <ListGroup variant="flush">
          {rewards.map((reward) => {
            const color = normalizeColor(reward?.badgeColor);
            const textColor = resolveBadgeTextColor(color);
            const title = composeTitle(reward);

            return (
              <ListGroup.Item key={reward.level} className="py-3">
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <Badge
                      bg="secondary"
                      style={{ backgroundColor: color, color: textColor, border: '1px solid rgba(0,0,0,0.1)' }}
                    >
                      {reward.label}
                    </Badge>
                    <span className="fw-semibold">{title}</span>
                  </div>
                  {reward.description && <div className="text-muted small">{reward.description}</div>}
                  {reward.purpose && (
                    <div className="small">
                      <span className="fw-medium">Цель:</span> {reward.purpose}
                    </div>
                  )}
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
