import { useState } from 'react';
import { Alert, Badge, Button, Card, Form, Stack } from 'react-bootstrap';

export default function ChatPanel({
  heading,
  thread,
  placeholder,
  emptyMessage = 'Пока нет сообщений в этом канале.',
}) {
  const [draftMessage, setDraftMessage] = useState('');
  const [messages, setMessages] = useState(thread?.messages ?? []);
  const participantsCount = thread?.participants?.length ?? 0;

  const handleSend = (event) => {
    event.preventDefault();
    if (!draftMessage.trim()) return;

    const nextMessage = {
      id: `draft-${Date.now()}`,
      author: 'Вы',
      text: draftMessage.trim(),
      createdAt: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [nextMessage, ...prev]);
    setDraftMessage('');
  };

  const hasMessages = messages.length > 0;

  return (
    <Card className="h-100 bg-body-tertiary border-0 shadow-sm">
      <Card.Body
        as={Form}
        onSubmit={handleSend}
        className="d-flex flex-column gap-3 text-body"
      >
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div>
            <Card.Title as="h3" className="mb-1">
              {heading}
            </Card.Title>
            {thread?.title ? (
              <Card.Text className="text-muted mb-0">{thread.title}</Card.Text>
            ) : null}
          </div>
          <Badge bg="secondary">Участников: {participantsCount}</Badge>
        </div>

        <Stack gap={3} className="flex-grow-1 overflow-auto" style={{ maxHeight: 320 }}>
          {hasMessages ? (
            messages.map((message) => (
              <Card
                key={message.id}
                className="border-0 bg-body-secondary text-body"
              >
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="fw-semibold">{message.author}</span>
                    <span className="text-muted small">{message.createdAt}</span>
                  </div>
                  <Card.Text className="mb-0">{message.text}</Card.Text>
                </Card.Body>
              </Card>
            ))
          ) : (
            <Alert variant="light" className="border text-muted text-center mb-0">
              {emptyMessage}
            </Alert>
          )}
        </Stack>

        <Stack direction="horizontal" gap={2} className="align-items-start">
          <Form.Control
            as="textarea"
            rows={2}
            placeholder={placeholder}
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
          />
          <Button type="submit" disabled={!draftMessage.trim()}>
            Отправить
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}
