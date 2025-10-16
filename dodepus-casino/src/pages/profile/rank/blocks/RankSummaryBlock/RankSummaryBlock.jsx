import { Card } from 'react-bootstrap';
import { buildBadgePreview } from '../../../../../shared/rank/badgeEffects.js';
import RankBadge from '../../../../../shared/rank/components/RankBadge.jsx';

const fallbackLevel = Object.freeze({
  label: 'VIP 0',
  shortLabel: 'VIP 0',
  tagline: 'Начните путь к бонусам: пополняйте счёт и открывайте VIP уровни.',
  description: '',
  purpose: '',
});

const formatAmount = (value, currency) => {
  const numeric = Number(value);
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;
  const safeCurrency = typeof currency === 'string' && currency ? currency : 'USD';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

const resolveTagline = (level) => {
  if (typeof level?.tagline === 'string' && level.tagline.trim()) {
    return level.tagline.trim();
  }
  if (typeof level?.rewardTitle === 'string' && level.rewardTitle.trim()) {
    return level.rewardTitle.trim();
  }
  return fallbackLevel.tagline;
};

export default function RankSummaryBlock({ summary }) {
  const currentLevel = summary?.currentLevel ?? fallbackLevel;
  const preview = buildBadgePreview(currentLevel);
  const currency = summary?.currency || 'USD';
  const nextLevel = summary?.nextLevel ?? null;
  const tagline = resolveTagline(currentLevel);
  const description = typeof currentLevel?.description === 'string' ? currentLevel.description.trim() : '';
  const purpose = typeof currentLevel?.purpose === 'string' ? currentLevel.purpose.trim() : '';

  const nextMessage = nextLevel
    ? `До ${nextLevel.label} осталось ${formatAmount(nextLevel.depositsRemaining ?? 0, currency)}.`
    : 'Вы уже на максимальном уровне VIP 10 — наслаждайтесь всеми привилегиями.';

  return (
    <Card className="bg-body-tertiary">
      <Card.Body className="d-flex flex-column gap-3">
        <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3">
          <RankBadge preview={preview} className="px-4 py-2 fs-4 fw-semibold text-uppercase">
            {currentLevel.shortLabel || currentLevel.label}
          </RankBadge>
          <div className="d-flex flex-column gap-1">
            <Card.Title className="mb-0">Ваш уровень — {currentLevel.label}</Card.Title>
            <div className="text-muted">{tagline}</div>
          </div>
        </div>

        {description && <div className="text-muted">{description}</div>}

        {purpose && (
          <div className="small text-muted">
            <span className="fw-semibold text-body-secondary">Зачем:</span> {purpose}
          </div>
        )}

        <div className="small text-muted">{nextMessage}</div>
      </Card.Body>
    </Card>
  );
}
