import { getCommunicationSnapshot } from './dataset.js';

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
  const snapshot = getCommunicationSnapshot();
  return snapshot.threads
    .filter((thread) => thread.channel === channel)
    .map((thread) => buildThread(thread, snapshot));
};

const loadThreadList = (channel) => freezeThreadList(buildThreadsByChannel(channel));

export const moderatorsChatThreads = loadThreadList('moderators');
export const administratorsChatThreads = loadThreadList('administrators');
export const staffChatThreads = loadThreadList('staff');

export const listModeratorsChatThreads = () => cloneThreads(buildThreadsByChannel('moderators'));
export const listAdministratorsChatThreads = () => cloneThreads(buildThreadsByChannel('administrators'));
export const listStaffChatThreads = () => cloneThreads(buildThreadsByChannel('staff'));

export const __internals = Object.freeze({
  buildThread,
  buildThreadsByChannel,
  loadThreadList,
});
