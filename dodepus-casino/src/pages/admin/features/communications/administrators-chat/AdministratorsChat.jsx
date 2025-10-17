import { COMMUNICATION_CHANNELS } from '../../../../../../local-sim/modules/communications/index.js';
import { AdminChatChannelPanel } from '../blocks/index.js';

export default function AdministratorsChat() {
  return (
    <AdminChatChannelPanel
      channel={COMMUNICATION_CHANNELS.ADMINISTRATORS}
      title="Админ Чат"
      placeholder="Напишите ответ администраторам…"
      emptyMessage="Пока нет сообщений от администраторов."
    />
  );
}

