import {
  getVerificationQueueSnapshot,
  listVerificationQueueRecords,
} from './dataset.js';

const formatSubmittedAt = (value) => {
  if (!value) {
    return '';
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return typeof value === 'string' ? value : '';
    }

    const formatter = new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return formatter.format(date).replace(',', '');
  } catch {
    return typeof value === 'string' ? value : '';
  }
};

const formatQueueRecord = (record) => ({
  id: record.id,
  requestId: record.requestId,
  userId: record.userId,
  documentType: record.documentType,
  status: record.status,
  priority: record.priority,
  submittedAt: formatSubmittedAt(record.submittedAt),
});

const freezeFormattedRecords = (records) =>
  records.map((record) => Object.freeze(formatQueueRecord(record)));

export const verificationQueue = Object.freeze(
  freezeFormattedRecords(getVerificationQueueSnapshot().records),
);

export const listAdminVerificationQueue = () =>
  listVerificationQueueRecords().map((record) => ({ ...formatQueueRecord(record) }));

export const __internals = Object.freeze({
  formatSubmittedAt,
  formatQueueRecord,
  freezeFormattedRecords,
});
