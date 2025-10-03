import { useState } from 'react';
import { Badge, Button, Card, Form, Stack } from 'react-bootstrap';
import { chatThreads } from '../../data/roleConfigs.js';

const activeThread = chatThreads[0];

export default function ModerationChat() {
  const [draftMessage, setDraftMessage] = useState('');
  const [messages, setMessages] = useState(activeThread?.messages ?? []);

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

  return (
    <Card className="h-100">
      <Card.Body as={Form} onSubmit={handleSend} className="d-flex flex-column gap-3">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div>
            <Card.Title as="h4" className="mb-1">
              Чат модераторов
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              {activeThread?.title}
            </Card.Text>
          </div>
          <Badge bg="secondary">Участников: {activeThread?.participants.length ?? 0}</Badge>
        </div>

        <Stack gap={3} className="flex-grow-1 overflow-auto" style={{ maxHeight: 320 }}>
          {messages.map((message) => (
            <Card key={message.id} className="border-0 bg-light">
              <Card.Body className="py-2">
                <div className="d-flex justify-content-between align-items-start">
                  <span className="fw-semibold">{message.author}</span>
                  <span className="text-muted small">{message.createdAt}</span>
                </div>
                <Card.Text className="mb-0">{message.text}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </Stack>

        <Stack direction="horizontal" gap={2} className="align-items-start">
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Напишите ответ модераторам…"
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
