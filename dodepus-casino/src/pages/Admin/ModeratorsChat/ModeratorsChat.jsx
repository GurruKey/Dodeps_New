import ChatPanel from '../components/ChatPanel.jsx';
import { moderatorsChatThreads } from '../roles/data/roleConfigs.js';

export default function ModeratorsChat() {
  const activeThread = moderatorsChatThreads[0];

  return (
    <ChatPanel
      heading="Модератор Чат"
      thread={activeThread}
      placeholder="Напишите ответ модераторам…"
    />
  );
}

