import { Card, ProgressBar } from 'react-bootstrap';
import { buildBadgePreview, getBadgeEffectMeta } from '@/shared/rank';
import { RankBadge } from '@/shared/rank';

const fallbackLevel = Object.freeze({
  label: 'VIP 0',
  shortLabel: 'VIP 0',
  rewardTitle: 'Начните путь к бонусам',
});

const resolveRewardTitle = (level) => {
  if (typeof level?.rewardTitle === 'string' && level.rewardTitle.trim()) {
    return level.rewardTitle.trim();
  }
  if (typeof level?.description === 'string' && level.description.trim()) {
    return level.description.trim();
  }
  return fallbackLevel.rewardTitle;
};

const clampPercent = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
};

export default function RankProgressBlock({ summary, levels = [] }) {
  const currentLevel = summary?.currentLevel ?? fallbackLevel;
  const nextLevel = summary?.nextLevel ?? null;
  const progressPercent = clampPercent(summary?.progressPercent ?? 0);
  const preview = buildBadgePreview(currentLevel);
  const rewardTitle = resolveRewardTitle(currentLevel);
  const currentLevelMeta = getBadgeEffectMeta(currentLevel);
  const nextLevelMeta = nextLevel ? getBadgeEffectMeta(nextLevel) : null;

  return (
    <Card>
      <Card.Body className="d-grid gap-3">
        <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3">
          <RankBadge preview={preview} className="px-4 py-2 fs-5 fw-semibold text-uppercase">
            {currentLevel.shortLabel || currentLevel.label}
          </RankBadge>
          <div className="d-flex flex-column gap-1">
            <Card.Title className="mb-0">Прогресс до следующего уровня</Card.Title>
            <div className="text-muted">{rewardTitle}</div>
          </div>
        </div>

        <ProgressBar now={progressPercent} label={`${Math.round(progressPercent)}%`} />

        <div className="row g-3">
          <div className="col-md-6">
            <Card className="bg-body-tertiary h-100">
              <Card.Body className="d-grid gap-1">
                <div className="text-secondary text-uppercase small">Текущий уровень</div>
                <div className="fw-semibold">{currentLevel.label}</div>
                {currentLevelMeta?.description ? (
                  <div className="text-muted small">{currentLevelMeta.description}</div>
                ) : null}
              </Card.Body>
            </Card>
          </div>

          <div className="col-md-6">
            <Card className="bg-body-tertiary h-100">
              <Card.Body className="d-grid gap-1">
                <div className="text-secondary text-uppercase small">Следующий уровень</div>
                <div className="fw-semibold">{nextLevel?.label ?? 'Максимальный уровень'}</div>
                {nextLevelMeta?.description ? (
                  <div className="text-muted small">{nextLevelMeta.description}</div>
                ) : null}
              </Card.Body>
            </Card>
          </div>
        </div>

        {Array.isArray(levels) && levels.length > 0 ? (
          <div className="d-grid gap-2">
            <div className="text-secondary small text-uppercase">Все уровни</div>
            <div className="d-flex flex-wrap gap-2">
              {levels.map((level) => {
                const levelPreview = buildBadgePreview(level);
                return (
                  <RankBadge
                    key={level.id || level.label}
                    preview={levelPreview}
                    className="px-3 py-1"
                  >
                    {level.shortLabel || level.label}
                  </RankBadge>
                );
              })}
            </div>
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}
