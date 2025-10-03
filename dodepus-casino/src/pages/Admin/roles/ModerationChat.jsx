import { Stack } from 'react-bootstrap';
import ModerationChatThread from './blocks/Chat/ModerationChat.jsx';

export default function ModerationChatPage() {
  return (
    <Stack gap={3}>
      <ModerationChatThread />
    </Stack>
  );
}
