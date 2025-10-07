const MODULE_KEYS = Object.freeze(['email', 'phone', 'address', 'doc']);

export const VERIFICATION_MODULES = Object.freeze([
  { key: 'email', label: 'Почта' },
  { key: 'phone', label: 'Телефон' },
  { key: 'address', label: 'Адрес' },
  { key: 'doc', label: 'Документы' },
]);

export const VERIFICATION_STATUS_LABELS = Object.freeze({
  pending: 'Ожидает проверки',
  partial: 'Частично подтверждено',
  approved: 'Подтверждено',
  rejected: 'Отклонено',
  idle: 'Не отправлено',
});

const normalizeStatus = (value) => {
  if (typeof value !== 'string') {
    return 'idle';
  }

  const normalized = value.trim().toLowerCase();
  if (['pending', 'processing', 'in_review'].includes(normalized)) {
    return 'pending';
  }

  if (normalized === 'partial') {
    return 'partial';
  }

  if (['approved', 'verified', 'success'].includes(normalized)) {
    return 'approved';
  }

  if (['rejected', 'declined', 'failed', 'error'].includes(normalized)) {
    return 'rejected';
  }

  if (['idle', 'new', 'created'].includes(normalized)) {
    return 'idle';
  }

  return normalized || 'idle';
};

const normalizeBooleanMap = (input = {}) => {
  if (!input || typeof input !== 'object') {
    return MODULE_KEYS.reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
  }

  return MODULE_KEYS.reduce((acc, key) => {
    acc[key] = Boolean(input[key]);
    return acc;
  }, {});
};

const parseTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  try {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  } catch {
    // ignore
  }

  return 0;
};

const createEmptyModuleState = () => ({
  status: 'idle',
  requested: false,
  completed: false,
  timestamp: 0,
  updatedAt: null,
  notes: '',
  requestId: '',
  source: '',
});

const ensureModuleMap = (input) => {
  const next = {};
  MODULE_KEYS.forEach((key) => {
    next[key] = { ...createEmptyModuleState(), ...(input?.[key] || {}) };
  });
  return next;
};

const collectRecordsFromRequest = (request) => {
  if (!request || typeof request !== 'object') {
    return [];
  }

  const records = [];
  const requestId = String(request.id || request.requestId || '') || '';
  const baseStatus = normalizeStatus(request.status);
  const baseTimestamp = parseTimestamp(
    request.updatedAt || request.reviewedAt || request.submittedAt,
  );
  const baseNotes = typeof request.notes === 'string' ? request.notes : '';

  const pushRecord = ({
    key,
    status,
    requested,
    completed,
    timestamp,
    updatedAt,
    notes,
    source,
  }) => {
    if (!MODULE_KEYS.includes(key)) {
      return;
    }

    if (!requested && !completed) {
      return;
    }

    records.push({
      key,
      status: normalizeStatus(status),
      requested: Boolean(requested || completed),
      completed: Boolean(completed),
      timestamp: Number.isFinite(timestamp) ? timestamp : 0,
      updatedAt: updatedAt || null,
      notes: typeof notes === 'string' ? notes : '',
      requestId,
      source,
    });
  };

  const requestedFields = normalizeBooleanMap(
    request.requestedFields ?? request.completedFields,
  );
  const completedFields = normalizeBooleanMap(request.completedFields);

  MODULE_KEYS.forEach((key) => {
    pushRecord({
      key,
      status: baseStatus,
      requested: requestedFields[key],
      completed: completedFields[key],
      timestamp: baseTimestamp,
      updatedAt:
        request.updatedAt || request.reviewedAt || request.submittedAt || null,
      notes: baseNotes,
      source: 'request',
    });
  });

  if (Array.isArray(request.history)) {
    request.history.forEach((entry) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }

      const entryStatus = normalizeStatus(entry.status || baseStatus);
      const entryTimestamp = parseTimestamp(entry.updatedAt) || baseTimestamp;
      const entryNotes = typeof entry.notes === 'string' ? entry.notes : baseNotes;
      const entryRequested = normalizeBooleanMap(
        entry.requestedFields ?? entry.completedFields,
      );
      const entryCompleted = normalizeBooleanMap(entry.completedFields);

      MODULE_KEYS.forEach((key) => {
        pushRecord({
          key,
          status: entryStatus,
          requested: entryRequested[key],
          completed: entryCompleted[key],
          timestamp: entryTimestamp,
          updatedAt: entry.updatedAt || request.updatedAt || null,
          notes: entryNotes,
          source: 'history',
        });
      });
    });
  }

  return records;
};

export const deriveModuleStatesFromRequests = (
  requests,
  { emailVerified = false } = {},
) => {
  const entries = Array.isArray(requests) ? requests : [];
  const records = entries.flatMap((request) => collectRecordsFromRequest(request));

  const map = ensureModuleMap();

  records
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach((record) => {
      const current = map[record.key] || createEmptyModuleState();
      if (record.timestamp < current.timestamp) {
        return;
      }

      let status = 'idle';
      if (record.completed) {
        status = 'approved';
      } else if (record.status === 'rejected') {
        status = 'rejected';
      } else if (record.status === 'approved') {
        status = record.requested ? 'approved' : 'idle';
      } else if (record.status === 'partial' || record.status === 'pending') {
        status = record.requested ? 'pending' : current.status;
      } else {
        status = record.requested ? 'pending' : 'idle';
      }

      map[record.key] = {
        status,
        requested: record.requested,
        completed: record.completed,
        timestamp: record.timestamp,
        updatedAt: record.updatedAt,
        notes: record.notes,
        requestId: record.requestId,
        source: record.source,
      };
    });

  const next = ensureModuleMap(map);

  if (emailVerified) {
    const current = next.email || createEmptyModuleState();
    if (current.status === 'idle') {
      next.email = {
        ...current,
        status: 'approved',
        requested: true,
        completed: true,
        source: current.source || 'profile',
      };
    }
  }

  return next;
};

export const summarizeModuleStates = (moduleMap) => {
  const map = ensureModuleMap(moduleMap);

  const summary = {
    total: MODULE_KEYS.length,
    approved: 0,
    pending: 0,
    rejected: 0,
    idle: 0,
    latestTimestamp: 0,
  };

  MODULE_KEYS.forEach((key) => {
    const entry = map[key];
    summary.latestTimestamp = Math.max(summary.latestTimestamp, entry.timestamp || 0);
    switch (entry.status) {
      case 'approved':
        summary.approved += 1;
        break;
      case 'pending':
        summary.pending += 1;
        break;
      case 'rejected':
        summary.rejected += 1;
        break;
      default:
        summary.idle += 1;
        break;
    }
  });

  summary.allApproved = summary.approved === summary.total;
  summary.hasPending = summary.pending > 0;
  summary.hasRejected = summary.rejected > 0;

  if (summary.hasPending) {
    summary.overall = 'pending';
  } else if (summary.hasRejected) {
    summary.overall = 'rejected';
  } else if (summary.allApproved) {
    summary.overall = 'approved';
  } else {
    summary.overall = 'idle';
  }

  return summary;
};

export const buildVerificationTimeline = (requests) => {
  const entries = Array.isArray(requests) ? requests : [];
  const events = [];

  entries.forEach((request) => {
    if (!request || typeof request !== 'object') {
      return;
    }

    const requestId = String(request.id || request.requestId || '') || '';
    const submittedAt = request.submittedAt || request.createdAt || null;
    const submittedTimestamp = parseTimestamp(submittedAt);
    const requestedFields = normalizeBooleanMap(
      request.requestedFields ?? request.completedFields,
    );

    if (submittedTimestamp) {
      events.push({
        id: `${requestId}:submitted:${submittedTimestamp}`,
        type: 'submitted',
        status: 'pending',
        modules: requestedFields,
        updatedAt: submittedAt,
        timestamp: submittedTimestamp,
        notes: '',
      });
    }

    if (Array.isArray(request.history) && request.history.length > 0) {
      request.history.forEach((entry, index) => {
        if (!entry || typeof entry !== 'object') {
          return;
        }

        const entryTimestamp = parseTimestamp(entry.updatedAt);
        const timestamp = entryTimestamp || parseTimestamp(request.updatedAt) || submittedTimestamp;
        const modules = normalizeBooleanMap(
          entry.completedFields ?? entry.requestedFields ?? {},
        );

        events.push({
          id: entry.id || `${requestId}:history:${index}`,
          type: 'history',
          status: normalizeStatus(entry.status || request.status),
          modules,
          updatedAt: entry.updatedAt || request.updatedAt || submittedAt,
          timestamp,
          notes: typeof entry.notes === 'string' ? entry.notes : '',
        });
      });
    } else {
      const status = normalizeStatus(request.status);
      const timestamp =
        parseTimestamp(request.reviewedAt) ||
        parseTimestamp(request.updatedAt) ||
        submittedTimestamp;

      if (status && timestamp) {
        events.push({
          id: `${requestId}:final`,
          type: 'final',
          status,
          modules: normalizeBooleanMap(
            request.completedFields ?? request.requestedFields ?? {},
          ),
          updatedAt:
            request.reviewedAt || request.updatedAt || request.submittedAt || null,
          timestamp,
          notes: typeof request.notes === 'string' ? request.notes : '',
        });
      }
    }
  });

  const byId = new Map();
  events.forEach((event) => {
    if (!event || !event.id) {
      return;
    }

    const existing = byId.get(event.id);
    if (!existing || event.timestamp >= existing.timestamp) {
      byId.set(event.id, event);
    }
  });

  return Array.from(byId.values()).sort((a, b) => b.timestamp - a.timestamp);
};

export const formatModuleList = (modules) => {
  const map = ensureModuleMap(
    Array.isArray(modules)
      ? modules.reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      : modules,
  );

  return VERIFICATION_MODULES.filter((module) => map[module.key])
    .map((module) => module.label)
    .join(', ');
};

