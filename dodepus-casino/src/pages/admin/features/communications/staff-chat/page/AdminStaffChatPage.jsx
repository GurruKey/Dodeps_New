import { COMMUNICATION_CHANNELS } from '@local-sim/modules/communications/index.js';
import { AdminChatChannelPanel } from '@/pages/admin/features/communications/index.js';

export default function AdminStaffChatPage() {
  return (
    <AdminChatChannelPanel
      channel={COMMUNICATION_CHANNELS.STAFF}
      title="Стаф Чат"
      placeholder="Напишите сообщение для стафа…"
      emptyMessage="Пока нет сообщений от стафа."
    />
  );
}
