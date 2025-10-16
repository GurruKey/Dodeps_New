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

export default function RankRewardsBlock({ rewards, currentLevel, nextLevel }) {
  const currentLevelValue = currentLevel?.level ?? null;
  const nextLevelValue = nextLevel?.level ?? null;

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
            const isCurrent = reward.level === currentLevelValue;
            const isNext = reward.level === nextLevelValue;
            const itemClasses = [
              'py-3',
              isCurrent && 'border border-success rounded bg-success-subtle',
              !isCurrent && isNext && 'border border-warning rounded bg-warning-subtle',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <ListGroup.Item key={reward.level} className={itemClasses}>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <RankBadge preview={preview} className="px-3">
                      {reward.label}
                    </RankBadge>
                    <span className="fw-semibold" style={{ color: preview.textColor }}>{title}</span>
                    {isCurrent && (
                      <span className="badge text-success-emphasis bg-success-subtle border border-success-subtle">
                        Ваш уровень
                      </span>
                    )}
                    {!isCurrent && isNext && (
                      <span className="badge text-warning-emphasis bg-warning-subtle border border-warning-subtle">
                        Следующая цель
                      </span>
                    )}
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
