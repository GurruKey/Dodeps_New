import ChatPanel from '../../../shared/ChatPanel.jsx';
import { listStaffChatThreads } from '../../../../../../local-sim/modules/communications/index.js';

const staffChatThreads = listStaffChatThreads();

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
