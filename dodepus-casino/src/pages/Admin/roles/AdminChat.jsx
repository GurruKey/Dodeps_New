import { Stack } from 'react-bootstrap';
import AdminChatThread from './blocks/Chat/AdminChat.jsx';

export default function AdminChatPage() {
  return (
    <Stack gap={3}>
      <AdminChatThread />
    </Stack>
  );
}
