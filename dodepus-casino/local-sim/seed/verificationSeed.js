import { normalizeBooleanMap } from '../logic/verificationHelpers.js';

const clone = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const buildHistoryEntry = ({ requestId, status, reviewer, notes, completed, requested, cleared, updatedAt }) => ({
  id: `seed-history-${Math.random().toString(36).slice(2, 8)}`,
  requestId,
  status,
  reviewer,
  notes,
  updatedAt,
  completedFields: normalizeBooleanMap(completed),
  requestedFields: normalizeBooleanMap(requested ?? completed),
  clearedFields: normalizeBooleanMap(cleared),
});

const baseRequest = ({ id, userId, status, submittedAt, updatedAt, completed, requested, history = [] }) => ({
  id,
  userId,
  status,
  submittedAt,
  updatedAt,
  completedFields: normalizeBooleanMap(completed),
  requestedFields: normalizeBooleanMap(requested ?? completed),
  history: history.map(clone),
});

const SEED_REQUESTS = {
  'seed-user-01': [
    baseRequest({
      id: 'seed-req-01',
      userId: 'seed-user-01',
      status: 'pending',
      submittedAt: '2024-01-10T09:00:00.000Z',
      updatedAt: '2024-01-10T09:00:00.000Z',
      completed: { email: false, phone: false, address: false, doc: false },
      requested: { email: true, phone: true, address: false, doc: false },
    }),
  ],
  'seed-user-02': [
    baseRequest({
      id: 'seed-req-02',
      userId: 'seed-user-02',
      status: 'approved',
      submittedAt: '2024-01-08T12:30:00.000Z',
      updatedAt: '2024-01-09T15:45:00.000Z',
      completed: { email: true, phone: true, address: false, doc: false },
      requested: { email: true, phone: true, address: false, doc: false },
      history: [
        buildHistoryEntry({
          requestId: 'seed-req-02',
          status: 'approved',
          updatedAt: '2024-01-09T15:45:00.000Z',
          reviewer: { id: 'admin-seed', name: 'Seed Admin', role: 'admin' },
          notes: 'Телефон подтверждён по смс-коду.',
          completed: { email: true, phone: true, address: false, doc: false },
        }),
      ],
    }),
  ],
  'seed-user-03': [
    baseRequest({
      id: 'seed-req-03',
      userId: 'seed-user-03',
      status: 'rejected',
      submittedAt: '2024-01-05T08:10:00.000Z',
      updatedAt: '2024-01-06T10:00:00.000Z',
      completed: { email: true, phone: false, address: false, doc: false },
      requested: { email: true, phone: true, address: false, doc: false },
      history: [
        buildHistoryEntry({
          requestId: 'seed-req-03',
          status: 'rejected',
          updatedAt: '2024-01-06T10:00:00.000Z',
          reviewer: { id: 'admin-seed', name: 'Seed Admin', role: 'admin' },
          notes: 'Неверный формат номера. Укажите код страны.',
          completed: { email: true, phone: false, address: false, doc: false },
        }),
      ],
    }),
  ],
  'seed-user-04': [
    baseRequest({
      id: 'seed-req-04',
      userId: 'seed-user-04',
      status: 'approved',
      submittedAt: '2024-01-02T11:20:00.000Z',
      updatedAt: '2024-01-04T17:05:00.000Z',
      completed: { email: true, phone: true, address: true, doc: true },
      requested: { email: true, phone: true, address: true, doc: true },
      history: [
        buildHistoryEntry({
          requestId: 'seed-req-04',
          status: 'approved',
          updatedAt: '2024-01-04T17:05:00.000Z',
          reviewer: { id: 'admin-seed', name: 'Seed Admin', role: 'admin' },
          notes: 'Полная верификация выполнена.',
          completed: { email: true, phone: true, address: true, doc: true },
        }),
      ],
    }),
  ],
};

export const getVerificationSeedForUser = (userId) => {
  const records = SEED_REQUESTS[userId];
  if (!records) {
    return { verificationRequests: [], verificationUploads: [] };
  }
  return { verificationRequests: clone(records), verificationUploads: [] };
};

export const applyVerificationSeed = (extras, userId) => {
  const seed = getVerificationSeedForUser(userId);
  if (!seed.verificationRequests.length) {
    return extras;
  }
  return {
    ...extras,
    verificationRequests: seed.verificationRequests,
    verificationUploads: Array.isArray(extras?.verificationUploads)
      ? extras.verificationUploads
      : [],
  };
};
