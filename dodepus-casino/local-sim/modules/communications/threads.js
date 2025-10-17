import { getCommunicationSnapshot } from './dataset.js';
import { COMMUNICATION_CHANNELS, COMMUNICATION_CHANNEL_LIST } from './constants.js';

const CHANNEL_VALUES = Object.freeze([...COMMUNICATION_CHANNEL_LIST]);
const KNOWN_CHANNELS = new Set(CHANNEL_VALUES);

const normalizeChannelInput = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return KNOWN_CHANNELS.has(normalized) ? normalized : null;
};

const formatTimestamp = (value) => {
  if (!value) {
    return '';
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const pad = (segment) => String(segment).padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch {
    return value;
  }
};

const freezeMessages = (messages = []) =>
  Object.freeze(messages.map((message) => Object.freeze({ ...message })));

const freezeParticipants = (participants = []) => Object.freeze([...participants]);

const freezeThread = (thread) =>
  Object.freeze({
    ...thread,
    participants: freezeParticipants(thread.participants),
    messages: freezeMessages(thread.messages),
  });

const freezeThreadList = (threads = []) => Object.freeze([...threads]);

const cloneThread = (thread) => ({
  ...thread,
  participants: [...thread.participants],
  messages: thread.messages.map((message) => ({ ...message })),
});

const cloneThreads = (threads) => threads.map((thread) => cloneThread(thread));

const buildThread = (record, snapshot) => {
  const rawParticipants = snapshot.participantsByThread.get(record.id) ?? [];
  const participantNames = rawParticipants.map((participant) => participant.displayName);

  const rawMessages = snapshot.messagesByThread.get(record.id) ?? [];
  const threadMessages = rawMessages.map((message) => {
    const author = message.participantId ? snapshot.participantsById.get(message.participantId) : null;
    return {
      id: message.id,
      author: author?.displayName ?? '—',
      text: message.body,
      createdAt: formatTimestamp(message.createdAt),
    };
  });

  return freezeThread({
    id: record.id,
    channel: record.channel,
    title: record.title,
    participants: participantNames,
    messages: threadMessages,
  });
};

const buildThreadsByChannel = (channel) => {
  const normalizedChannel = normalizeChannelInput(channel);
  if (!normalizedChannel) {
    return [];
  }

  const snapshot = getCommunicationSnapshot();
  return snapshot.threads
    .filter((thread) => thread.channel === normalizedChannel)
    .map((thread) => buildThread(thread, snapshot));
};

const loadThreadList = (channel) => freezeThreadList(buildThreadsByChannel(channel));

export const moderatorsChatThreads = loadThreadList(COMMUNICATION_CHANNELS.MODERATORS);
export const administratorsChatThreads =
  loadThreadList(COMMUNICATION_CHANNELS.ADMINISTRATORS);
export const staffChatThreads = loadThreadList(COMMUNICATION_CHANNELS.STAFF);

export const listCommunicationThreads = (channel) => cloneThreads(buildThreadsByChannel(channel));

export const listModeratorsChatThreads = () =>
  listCommunicationThreads(COMMUNICATION_CHANNELS.MODERATORS);
export const listAdministratorsChatThreads = () =>
  listCommunicationThreads(COMMUNICATION_CHANNELS.ADMINISTRATORS);
export const listStaffChatThreads = () =>
  listCommunicationThreads(COMMUNICATION_CHANNELS.STAFF);

export const __internals = Object.freeze({
  buildThread,
  buildThreadsByChannel,
  loadThreadList,
  normalizeChannelInput,
  KNOWN_CHANNELS,
});
