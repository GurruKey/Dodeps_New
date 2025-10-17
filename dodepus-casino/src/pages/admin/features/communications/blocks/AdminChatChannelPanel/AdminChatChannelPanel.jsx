import ChatPanel from '../../../shared/ChatPanel.jsx';
import { useAdminChatChannel } from '../../hooks/index.js';

export default function AdminChatChannelPanel({
  channel,
  title,
  placeholder,
  emptyMessage = 'Пока нет сообщений в этом канале.',
}) {
  const { activeThread } = useAdminChatChannel(channel);

  return (
    <ChatPanel
      heading={title}
      thread={activeThread}
      placeholder={placeholder}
      emptyMessage={emptyMessage}
    />
  );
}
