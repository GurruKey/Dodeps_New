import { getLocalDatabase } from '../../database/engine.js';
import {
  COMMUNICATION_MESSAGES_TABLE,
  COMMUNICATION_THREAD_PARTICIPANTS_TABLE,
  COMMUNICATION_THREADS_TABLE,
} from './constants.js';

const safeClone = (value) => {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // ignore structuredClone failures
    }
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const toTrimmedString = (value, fallback = '') => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    const text = String(value).trim();
    return text || fallback;
  }

  return fallback;
};

const toNullableString = (value) => {
  const text = toTrimmedString(value, '');
  return text || null;
};

const normalizeChannel = (value) => {
  const channel = toTrimmedString(value, '').toLowerCase();
  return channel || 'general';
};

const toTimestampString = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }

  return null;
};

const parseTimestamp = (value) => {
  if (!value) {
    return Number.NaN;
  }
  const date = new Date(value);
  return date.getTime();
};

const freezeRecord = (record) => Object.freeze({ ...record });

const freezeRecords = (records = []) => Object.freeze(records.map((record) => freezeRecord(record)));

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const compareByUpdatedAtDesc = (a, b) => {
  const updatedA = parseTimestamp(a.updatedAt ?? a.createdAt ?? null);
  const updatedB = parseTimestamp(b.updatedAt ?? b.createdAt ?? null);

  if (Number.isNaN(updatedA) && Number.isNaN(updatedB)) {
    return 0;
  }
  if (Number.isNaN(updatedA)) {
    return 1;
  }
  if (Number.isNaN(updatedB)) {
    return -1;
  }

  if (updatedA === updatedB) {
    return a.id.localeCompare(b.id);
  }

  return updatedB - updatedA;
};

const compareByJoinedAtAsc = (a, b) => {
  const joinedA = parseTimestamp(a.joinedAt ?? null);
  const joinedB = parseTimestamp(b.joinedAt ?? null);

  if (Number.isNaN(joinedA) && Number.isNaN(joinedB)) {
    return a.displayName.localeCompare(b.displayName);
  }
  if (Number.isNaN(joinedA)) {
    return 1;
  }
  if (Number.isNaN(joinedB)) {
    return -1;
  }

  if (joinedA === joinedB) {
    return a.displayName.localeCompare(b.displayName);
  }

  return joinedA - joinedB;
};

const compareMessagesByCreatedAtDesc = (a, b) => {
  const createdA = parseTimestamp(a.createdAt ?? null);
  const createdB = parseTimestamp(b.createdAt ?? null);

  if (Number.isNaN(createdA) && Number.isNaN(createdB)) {
    return a.id.localeCompare(b.id);
  }
  if (Number.isNaN(createdA)) {
    return 1;
  }
  if (Number.isNaN(createdB)) {
    return -1;
  }

  if (createdA === createdB) {
    return a.id.localeCompare(b.id);
  }

  return createdB - createdA;
};

export const mapThreadRowToRecord = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toTrimmedString(row.id, '');
  if (!id) {
    return null;
  }

  return {
    id,
    channel: normalizeChannel(row.channel ?? row.channel_name ?? ''),
    title: toTrimmedString(row.title ?? row.thread_title, ''),
    createdAt: toTimestampString(row.created_at ?? row.createdAt),
    updatedAt: toTimestampString(row.updated_at ?? row.updatedAt),
  };
};

export const mapParticipantRowToRecord = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toTrimmedString(row.id, '');
  const threadId = toTrimmedString(row.thread_id ?? row.threadId, '');
  const displayName = toTrimmedString(row.display_name ?? row.displayName, '');

  if (!id || !threadId || !displayName) {
    return null;
  }

  return {
    id,
    threadId,
    displayName,
    joinedAt: toTimestampString(row.joined_at ?? row.joinedAt),
  };
};

export const mapMessageRowToRecord = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toTrimmedString(row.id, '');
  const threadId = toTrimmedString(row.thread_id ?? row.threadId, '');
  const participantId = toNullableString(row.participant_id ?? row.participantId);
  const body = toTrimmedString(row.body ?? row.text, '');

  if (!id || !threadId) {
    return null;
  }

  return {
    id,
    threadId,
    participantId,
    body,
    createdAt: toTimestampString(row.created_at ?? row.createdAt),
  };
};

export const mapThreadRecordToRow = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const id = toTrimmedString(record.id, '');
  if (!id) {
    return null;
  }

  return {
    id,
    channel: normalizeChannel(record.channel ?? ''),
    title: toTrimmedString(record.title, ''),
    created_at: toTimestampString(record.createdAt),
    updated_at: toTimestampString(record.updatedAt),
  };
};

export const mapParticipantRecordToRow = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const id = toTrimmedString(record.id, '');
  const threadId = toTrimmedString(record.threadId, '');
  const displayName = toTrimmedString(record.displayName, '');

  if (!id || !threadId || !displayName) {
    return null;
  }

  return {
    id,
    thread_id: threadId,
    display_name: displayName,
    joined_at: toTimestampString(record.joinedAt),
  };
};

export const mapMessageRecordToRow = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const id = toTrimmedString(record.id, '');
  const threadId = toTrimmedString(record.threadId, '');
  const body = toTrimmedString(record.body, '');

  if (!id || !threadId) {
    return null;
  }

  return {
    id,
    thread_id: threadId,
    participant_id: toNullableString(record.participantId),
    body,
    created_at: toTimestampString(record.createdAt),
  };
};

export const readCommunicationThreadRecords = () => {
  const db = getLocalDatabase();
  const records = db
    .select(COMMUNICATION_THREADS_TABLE)
    .map(mapThreadRowToRecord)
    .filter(Boolean);

  records.sort(compareByUpdatedAtDesc);
  return freezeRecords(records);
};

export const readCommunicationParticipantRecords = () => {
  const db = getLocalDatabase();
  const records = db
    .select(COMMUNICATION_THREAD_PARTICIPANTS_TABLE)
    .map(mapParticipantRowToRecord)
    .filter(Boolean);

  records.sort(compareByJoinedAtAsc);
  return freezeRecords(records);
};

export const readCommunicationMessageRecords = () => {
  const db = getLocalDatabase();
  const records = db
    .select(COMMUNICATION_MESSAGES_TABLE)
    .map(mapMessageRowToRecord)
    .filter(Boolean);

  records.sort(compareMessagesByCreatedAtDesc);
  return freezeRecords(records);
};

export const readCommunicationDataset = () => ({
  threads: readCommunicationThreadRecords(),
  participants: readCommunicationParticipantRecords(),
  messages: readCommunicationMessageRecords(),
});

export const getCommunicationSnapshot = () => {
  const { threads, participants, messages } = readCommunicationDataset();

  const participantsById = new Map(participants.map((participant) => [participant.id, participant]));
  const participantsByThread = new Map();
  const messagesByThread = new Map();

  participants.forEach((participant) => {
    if (!participantsByThread.has(participant.threadId)) {
      participantsByThread.set(participant.threadId, []);
    }
    participantsByThread.get(participant.threadId).push(participant);
  });

  participantsByThread.forEach((list, threadId) => {
    const sorted = ensureArray(list).slice().sort(compareByJoinedAtAsc);
    participantsByThread.set(threadId, Object.freeze(sorted));
  });

  messages.forEach((message) => {
    if (!messagesByThread.has(message.threadId)) {
      messagesByThread.set(message.threadId, []);
    }
    messagesByThread.get(message.threadId).push(message);
  });

  messagesByThread.forEach((list, threadId) => {
    const sorted = ensureArray(list).slice().sort(compareMessagesByCreatedAtDesc);
    messagesByThread.set(threadId, Object.freeze(sorted));
  });

  return Object.freeze({
    threads: Object.freeze(threads.slice()),
    participants: Object.freeze(participants.slice()),
    messages: Object.freeze(messages.slice()),
    participantsById,
    participantsByThread,
    messagesByThread,
  });
};

export const writeCommunicationThreads = (records) => {
  const db = getLocalDatabase();
  const rows = ensureArray(records)
    .map(mapThreadRecordToRow)
    .filter(Boolean);

  db.replaceWhere(COMMUNICATION_THREADS_TABLE, () => true, rows);
  return rows
    .map((row) => mapThreadRowToRecord(row))
    .filter(Boolean)
    .map((record) => freezeRecord(record));
};

export const writeCommunicationParticipants = (records) => {
  const db = getLocalDatabase();
  const rows = ensureArray(records)
    .map(mapParticipantRecordToRow)
    .filter(Boolean);

  db.replaceWhere(COMMUNICATION_THREAD_PARTICIPANTS_TABLE, () => true, rows);
  return rows
    .map((row) => mapParticipantRowToRecord(row))
    .filter(Boolean)
    .map((record) => freezeRecord(record));
};

export const writeCommunicationMessages = (records) => {
  const db = getLocalDatabase();
  const rows = ensureArray(records)
    .map(mapMessageRecordToRow)
    .filter(Boolean);

  db.replaceWhere(COMMUNICATION_MESSAGES_TABLE, () => true, rows);
  return rows
    .map((row) => mapMessageRowToRecord(row))
    .filter(Boolean)
    .map((record) => freezeRecord(record));
};

export const __internals = Object.freeze({
  safeClone,
  toTrimmedString,
  toNullableString,
  normalizeChannel,
  toTimestampString,
  parseTimestamp,
  compareByUpdatedAtDesc,
  compareByJoinedAtAsc,
  compareMessagesByCreatedAtDesc,
});
