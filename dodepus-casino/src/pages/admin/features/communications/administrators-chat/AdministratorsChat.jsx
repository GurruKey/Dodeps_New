import ChatPanel from '../../../shared/ChatPanel.jsx';
import { listAdministratorsChatThreads } from '../../../../../../local-sim/modules/communications/index.js';

const administratorsChatThreads = listAdministratorsChatThreads();

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

