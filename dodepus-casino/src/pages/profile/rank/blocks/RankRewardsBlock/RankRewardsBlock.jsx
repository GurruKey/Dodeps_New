import { Card, ListGroup } from 'react-bootstrap';
import { buildBadgePreview, getBadgeEffectMeta } from '../../../../../shared/rank/badgeEffects.js';
import RankBadge from '../../../../../shared/rank/components/RankBadge.jsx';

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

export default function RankRewardsBlock({ rewards }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Награды за ранги</Card.Title>
        <div className="text-muted mb-3">
          Получайте дополнительные бонусы и сервис, достигая новых уровней VIP.
        </div>
        <ListGroup variant="flush">
          {rewards.map((reward) => {
            const preview = buildBadgePreview(reward);
            const effectMeta = getBadgeEffectMeta(reward?.badgeEffect);
            const title = composeTitle(reward);
            const speed = Number.isFinite(reward?.badgeEffectSpeed)
              ? reward.badgeEffectSpeed
              : 6;

            return (
              <ListGroup.Item key={reward.level} className="py-3">
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <RankBadge preview={preview} className="px-3">
                      {reward.label}
                    </RankBadge>
                    <span className="fw-semibold" style={{ color: preview.textColor }}>{title}</span>
                  </div>
                  <div className="small text-muted">
                    Эффект: {effectMeta.label}
                    {effectMeta.value !== 'solid' && ` · ${speed}s`}
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
