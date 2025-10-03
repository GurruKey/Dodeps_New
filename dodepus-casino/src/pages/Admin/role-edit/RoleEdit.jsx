import { Stack } from 'react-bootstrap';
import EditRolePermissions from '../roles/blocks/EditRole/EditRolePermissions.jsx';
import ModerationChat from '../roles/blocks/Chat/ModerationChat.jsx';

export default function RoleEdit() {
  return (
    <Stack gap={3}>
      <EditRolePermissions />
      <ModerationChat />
    </Stack>
  );
}
