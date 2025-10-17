import { COMMUNICATION_CHANNELS } from '../../../../../../local-sim/modules/communications/index.js';
import { AdminChatChannelPanel } from '../blocks/index.js';

export default function StaffChat() {
  return (
    <AdminChatChannelPanel
      channel={COMMUNICATION_CHANNELS.STAFF}
      title="Стаф Чат"
      placeholder="Напишите сообщение для стафа…"
      emptyMessage="Пока нет сообщений от стафа."
    />
  );
}
