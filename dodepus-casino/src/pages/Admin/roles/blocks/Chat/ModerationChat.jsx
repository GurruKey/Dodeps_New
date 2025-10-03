import ChatThreadCard from './ChatThreadCard.jsx';

export default function ModerationChat() {
  return (
    <ChatThreadCard
      threadId="moderators"
      title="Чат модераторов"
      messagePlaceholder="Напишите ответ модераторам…"
    />
  );
}
