import { COMMUNICATION_CHANNELS } from '@local-sim/modules/communications/index.js';
import { AdminChatChannelPanel } from '@/pages/admin/features/communications/index.js';

export default function AdminModeratorsChatPage() {
  return (
    <AdminChatChannelPanel
      channel={COMMUNICATION_CHANNELS.MODERATORS}
      title="Модератор Чат"
      placeholder="Напишите ответ модераторам…"
      emptyMessage="Пока нет сообщений от модераторов."
    />
  );
}

