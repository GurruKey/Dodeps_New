import ChatPanel from '../../../shared/ChatPanel.jsx';
import { staffChatThreads } from '../../access/roles/data/roleConfigs.js';

export default function StaffChat() {
  const activeThread = staffChatThreads[0];

  return (
    <ChatPanel
      heading="Стаф Чат"
      thread={activeThread}
      placeholder="Напишите сообщение для стафа…"
    />
  );
}
