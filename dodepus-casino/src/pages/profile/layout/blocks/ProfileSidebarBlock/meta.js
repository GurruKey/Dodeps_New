import { buildBadgePreview } from '../../../../../shared/rank/badgeEffects.js';

export const pickRankBadgeMeta = (rankSummary) => {
  const preview = buildBadgePreview(rankSummary?.currentLevel ?? {});

  return {
    label:
      rankSummary?.currentLevel?.shortLabel ||
      rankSummary?.currentLevel?.label ||
      'VIP 0',
    preview,
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
