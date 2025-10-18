import { COMMUNICATION_CHANNELS } from '@local-sim/modules/communications/index.js';
import { AdminChatChannelPanel } from '@/pages/admin/features/communications/index.js';

export default function AdminAdministratorsChatPage() {
  return (
    <AdminChatChannelPanel
      channel={COMMUNICATION_CHANNELS.ADMINISTRATORS}
      title="Админ Чат"
      placeholder="Напишите ответ администраторам…"
      emptyMessage="Пока нет сообщений от администраторов."
    />
  );
}

