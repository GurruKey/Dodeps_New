import ChatPanel from '../components/ChatPanel.jsx';
import { moderatorsChatThreads } from '../Roles/data/roleConfigs.js';

export default function ModeratorsChat() {
  const activeThread = moderatorsChatThreads[0];

  return (
    <ChatPanel
      heading="Чат модераторов"
      thread={activeThread}
      placeholder="Напишите ответ модераторам…"
    />
  );
}

