import { RANK_LEVELS } from './constants.js';

const ensureNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const cloneLevel = (level) => ({
  level: level.level,
  label: level.label,
  shortLabel: level.shortLabel,
  depositStep: level.depositStep,
  totalDeposit: level.totalDeposit,
});

export const resolveRankProgress = (totalDepositsInput = 0) => {
  const totalDeposits = Math.max(0, ensureNumber(totalDepositsInput));

  const orderedLevels = RANK_LEVELS.map(cloneLevel).sort(
    (a, b) => a.totalDeposit - b.totalDeposit
  );

  let current = orderedLevels[0];
  let next = null;

  for (const level of orderedLevels) {
    if (totalDeposits >= level.totalDeposit) {
      current = level;
      continue;
    }
    next = level;
    break;
  }

  if (!next) {
    const lastLevel = orderedLevels[orderedLevels.length - 1];
    next = lastLevel.level === current.level ? null : lastLevel;
  }

  const baseDeposit = current?.totalDeposit ?? 0;
  const targetDeposit = next?.totalDeposit ?? baseDeposit;
  const requiredDelta = Math.max(0, targetDeposit - baseDeposit);
  const progressValue = requiredDelta > 0
    ? Math.min(1, Math.max(0, (totalDeposits - baseDeposit) / requiredDelta))
    : 1;

  return {
    totalDeposits,
    progressPercent: Math.round(progressValue * 100),
    currentLevel: current ? { ...current } : null,
    nextLevel: next
      ? {
          ...next,
          depositsRemaining: Math.max(0, targetDeposit - totalDeposits),
        }
      : null,
    levels: orderedLevels,
  };
};
