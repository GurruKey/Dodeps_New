import { nowIso } from '../core/helpers.js';
import { updatePromocodeRecord } from '../core/repository.js';

export const pauseAdminPromocode = (idOrCode) =>
  updatePromocodeRecord(idOrCode, (draft) => {
    draft.status = 'paused';
    draft.updatedAt = nowIso();
    return draft;
  });

export const resumeAdminPromocode = (idOrCode) =>
  updatePromocodeRecord(idOrCode, (draft) => {
    draft.status = 'active';
    draft.updatedAt = nowIso();
    return draft;
  });

export const archiveAdminPromocode = (idOrCode) =>
  updatePromocodeRecord(idOrCode, (draft) => {
    draft.status = 'archived';
    draft.updatedAt = nowIso();
    return draft;
  });

export const extendAdminPromocodeEndsAt = (idOrCode, { hours = 24 } = {}) =>
  updatePromocodeRecord(idOrCode, (draft) => {
    const now = new Date();
    const base = draft.endsAt ? new Date(draft.endsAt) : now;
    if (Number.isNaN(base.getTime())) {
      base.setTime(now.getTime());
    }
    base.setTime(base.getTime() + Math.max(1, Number(hours) || 0) * 60 * 60 * 1000);
    const nextEndsAt = base.toISOString();
    draft.endsAt = nextEndsAt;
    draft.params = draft.params && typeof draft.params === 'object' ? { ...draft.params } : {};
    if (draft.params.schedule && typeof draft.params.schedule === 'object') {
      draft.params.schedule = { ...draft.params.schedule, endsAt: nextEndsAt };
    }
    draft.updatedAt = nowIso();
    return draft;
  });
