import { normalizeHexColor, resolveAutoTextColor } from '../../../../../shared/rank/badgeEffects.js';

const DEFAULT_BADGE_COLOR = '#adb5bd';

const pickBadgeColor = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }
  return normalizeHexColor(value, DEFAULT_BADGE_COLOR);
};

export const pickRankBadgeMeta = (rankSummary) => {
  const badgeColor = pickBadgeColor(rankSummary?.currentLevel?.badgeColor);
  const badgeTextColor = normalizeHexColor(
    rankSummary?.currentLevel?.badgeTextColor,
    resolveAutoTextColor(badgeColor ?? DEFAULT_BADGE_COLOR),
  );
  const rankBadgeVariant = badgeColor
    ? null
    : rankSummary?.currentLevel?.level >= 5
      ? 'warning'
      : 'secondary';

  return {
    label:
      rankSummary?.currentLevel?.shortLabel ||
      rankSummary?.currentLevel?.label ||
      'VIP 0',
    style: badgeColor
      ? {
          backgroundColor: badgeColor,
          color: badgeTextColor,
          border: '1px solid rgba(0, 0, 0, 0.1)',
        }
      : undefined,
    variant: rankBadgeVariant ?? 'secondary',
  };
};

export const pickVerificationMeta = (verificationSummary = {}) => {
  const approved = Number.isFinite(verificationSummary.approved)
    ? verificationSummary.approved
    : 0;
  const total = Number.isFinite(verificationSummary.total)
    ? verificationSummary.total
    : 4;
  const variant = verificationSummary.hasRejected
    ? 'danger'
    : verificationSummary.hasPending
      ? 'warning'
      : verificationSummary.allApproved
        ? 'success'
        : 'secondary';
  const labelClass = verificationSummary.hasRejected
    ? 'text-danger fw-semibold'
    : verificationSummary.hasPending
      ? 'text-warning fw-semibold'
      : verificationSummary.allApproved
        ? 'text-success fw-semibold'
        : '';

  return {
    approved,
    total,
    variant,
    labelClass: labelClass.trim() || undefined,
  };
};

export const formatBalance = (value, currency) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(value ?? 0);
