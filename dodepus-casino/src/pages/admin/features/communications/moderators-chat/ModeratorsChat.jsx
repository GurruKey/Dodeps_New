import { COMMUNICATION_CHANNELS } from '../../../../../../local-sim/modules/communications/index.js';
import { AdminChatChannelPanel } from '../blocks/index.js';

export default function ModeratorsChat() {
  return (
    <AdminChatChannelPanel
      channel={COMMUNICATION_CHANNELS.MODERATORS}
      title="Модератор Чат"
      placeholder="Напишите ответ модераторам…"
      emptyMessage="Пока нет сообщений от модераторов."
    />
  );
}

