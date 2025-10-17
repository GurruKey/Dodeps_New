export const COMMUNICATION_CHANNELS = Object.freeze({
  MODERATORS: 'moderators',
  ADMINISTRATORS: 'administrators',
  STAFF: 'staff',
});

export const COMMUNICATION_CHANNEL_LIST = Object.freeze(
  Object.values(COMMUNICATION_CHANNELS)
);

export {
  COMMUNICATION_THREADS_TABLE,
  COMMUNICATION_THREAD_PARTICIPANTS_TABLE,
  COMMUNICATION_MESSAGES_TABLE,
} from '../shared/index.js';
