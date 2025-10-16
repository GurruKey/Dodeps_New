import ChatPanel from '../../../shared/ChatPanel.jsx';
import { listModeratorsChatThreads } from '../../../../../../local-sim/modules/communications/index.js';

const moderatorsChatThreads = listModeratorsChatThreads();

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

