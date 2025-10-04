import ChatPanel from '../components/ChatPanel.jsx';
import { administratorsChatThreads } from '../roles/data/roleConfigs.js';

export default function AdministratorsChat() {
  const activeThread = administratorsChatThreads[0];

  return (
    <ChatPanel
      heading="Админ Чат"
      thread={activeThread}
      placeholder="Напишите ответ администраторам…"
    />
  );
}

