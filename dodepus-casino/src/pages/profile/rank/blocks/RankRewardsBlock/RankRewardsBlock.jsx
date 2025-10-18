import { Card } from 'react-bootstrap';
import { buildBadgePreview, getBadgeEffectMeta } from '@/shared/rank';
import { RankBadge } from '@/shared/rank';

const normalizeRewards = (rewards) => {
  if (!Array.isArray(rewards)) return [];
  return rewards
    .map((reward) => ({
      id: reward?.id ?? reward?.label ?? reward?.title ?? Math.random().toString(36),
      label: reward?.label ?? reward?.title ?? 'Бонус',
      description: reward?.description ?? '',
      amount: reward?.amount ?? null,
      currency: reward?.currency ?? 'USD',
      type: reward?.type ?? 'bonus',
      badge: reward?.badge ?? null,
    }))
    .filter((reward) => reward.label);
};

const formatRewardAmount = (amount, currency) => {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null;
  const safeCurrency = typeof currency === 'string' && currency ? currency : 'USD';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: amount < 100 ? 2 : 0,
  }).format(amount);
};

export default function RankRewardsBlock({ rewards = [], currentLevel, nextLevel }) {
  const normalizedRewards = normalizeRewards(rewards);
  const currentPreview = buildBadgePreview(currentLevel);
  const nextPreview = nextLevel ? buildBadgePreview(nextLevel) : null;
  const currentMeta = getBadgeEffectMeta(currentLevel);
  const nextMeta = nextLevel ? getBadgeEffectMeta(nextLevel) : null;

  return (
    <Card>
      <Card.Body className="d-grid gap-3">
        <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3">
          <RankBadge preview={currentPreview} className="px-4 py-2 fs-5 fw-semibold text-uppercase">
            {currentLevel?.shortLabel || currentLevel?.label || 'VIP 0'}
          </RankBadge>
          <div className="d-flex flex-column gap-1">
            <Card.Title className="mb-0">Бонусы текущего уровня</Card.Title>
            {currentMeta?.description ? <div className="text-muted">{currentMeta.description}</div> : null}
          </div>
        </div>

        {normalizedRewards.length > 0 ? (
          <div className="d-grid gap-2">
            {normalizedRewards.map((reward) => {
              const formattedAmount = formatRewardAmount(reward.amount, reward.currency);
              return (
                <Card key={reward.id} className="bg-body-tertiary">
                  <Card.Body className="d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center">
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{reward.label}</div>
                      {reward.description ? (
                        <div className="text-muted small">{reward.description}</div>
                      ) : null}
                    </div>
                    {formattedAmount ? (
                      <div className="fw-semibold text-success">{formattedAmount}</div>
                    ) : null}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-muted small">
            Бонусы ещё не назначены. Продолжайте играть, чтобы открывать новые привилегии.
          </div>
        )}

        {nextLevel ? (
          <div className="d-grid gap-2">
            <div className="text-secondary small text-uppercase">Следующий уровень</div>
            <Card className="bg-body-terтиary">
              <Card.Body className="d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center">
                <RankBadge preview={nextPreview} className="px-3 py-1">
                  {nextLevel.shortLabel || nextLevel.label}
                </RankBadge>
                <div className="flex-grow-1">
                  <div className="fw-semibold">{nextLevel.label}</div>
                  {nextMeta?.description ? (
                    <div className="text-muted small">{nextMeta.description}</div>
                  ) : null}
                </div>
              </Card.Body>
            </Card>
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}
