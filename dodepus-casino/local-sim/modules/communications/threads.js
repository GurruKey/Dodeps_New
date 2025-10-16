import threadRecords from '../../db/communication_threads.json' assert { type: 'json' };
import participantRecords from '../../db/communication_thread_participants.json' assert { type: 'json' };
import messageRecords from '../../db/communication_messages.json' assert { type: 'json' };

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

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const participantMap = new Map(
  ensureArray(participantRecords).map((participant) => [participant.id, participant]),
);

const participantsByThread = ensureArray(participantRecords).reduce((acc, participant) => {
  if (!acc.has(participant.thread_id)) {
    acc.set(participant.thread_id, []);
  }
  acc.get(participant.thread_id).push(participant);
  return acc;
}, new Map());

const messagesByThread = ensureArray(messageRecords).reduce((acc, message) => {
  if (!acc.has(message.thread_id)) {
    acc.set(message.thread_id, []);
  }
  acc.get(message.thread_id).push(message);
  return acc;
}, new Map());

const compareByCreatedAtDesc = (a, b) => {
  const timeA = Date.parse(a.created_at || 0);
  const timeB = Date.parse(b.created_at || 0);
  if (Number.isNaN(timeA) || Number.isNaN(timeB)) {
    return 0;
  }
  return timeB - timeA;
};

const buildThread = (record) => {
  const rawParticipants = participantsByThread.get(record.id) ?? [];
  const participantNames = rawParticipants.map((participant) => participant.display_name);

  const rawMessages = (messagesByThread.get(record.id) ?? []).slice().sort(compareByCreatedAtDesc);
  const threadMessages = rawMessages.map((message) => {
    const author = participantMap.get(message.participant_id);
    return {
      id: message.id,
      author: author?.display_name ?? '—',
      text: message.body,
      createdAt: formatTimestamp(message.created_at),
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

const THREADS = freezeThreadList(
  ensureArray(threadRecords).map((record) => buildThread(record)),
);

const filterThreadsByChannel = (channel) =>
  THREADS.filter((thread) => thread.channel === channel);

export const moderatorsChatThreads = freezeThreadList(filterThreadsByChannel('moderators'));
export const administratorsChatThreads = freezeThreadList(filterThreadsByChannel('administrators'));
export const staffChatThreads = freezeThreadList(filterThreadsByChannel('staff'));

export const listModeratorsChatThreads = () => cloneThreads(filterThreadsByChannel('moderators'));
export const listAdministratorsChatThreads = () => cloneThreads(filterThreadsByChannel('administrators'));
export const listStaffChatThreads = () => cloneThreads(filterThreadsByChannel('staff'));

export const __internals = Object.freeze({
  THREADS,
  participantMap,
  participantsByThread,
  messagesByThread,
});
