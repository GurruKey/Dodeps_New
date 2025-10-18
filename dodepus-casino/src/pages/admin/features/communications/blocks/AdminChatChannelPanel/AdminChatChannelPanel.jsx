import { AdminChatPanel } from '@/pages/admin/shared/index.js';
import { useAdminChatChannel } from '@/pages/admin/features/communications/hooks/index.js';

export default function AdminChatChannelPanel({
  channel,
  title,
  placeholder,
  emptyMessage = 'Пока нет сообщений в этом канале.',
}) {
  const { activeThread } = useAdminChatChannel(channel);

  return (
    <AdminChatPanel
      heading={title}
      thread={activeThread}
      placeholder={placeholder}
      emptyMessage={emptyMessage}
    />
  );
}
