import ChatThreadCard from './ChatThreadCard.jsx';

export default function AdminChat() {
  return (
    <ChatThreadCard
      threadId="administrators"
      title="Чат администраторов"
      messagePlaceholder="Напишите сообщение для администраторов…"
    />
  );
}
