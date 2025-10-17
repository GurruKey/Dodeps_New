export const COMMUNICATION_CHANNELS = Object.freeze({
  MODERATORS: 'moderators',
  ADMINISTRATORS: 'administrators',
  STAFF: 'staff',
});

export const COMMUNICATION_CHANNEL_LIST = Object.freeze(
  Object.values(COMMUNICATION_CHANNELS)
);

export const COMMUNICATION_THREADS_TABLE = 'communication_threads';
export const COMMUNICATION_THREAD_PARTICIPANTS_TABLE =
  'communication_thread_participants';
export const COMMUNICATION_MESSAGES_TABLE = 'communication_messages';
