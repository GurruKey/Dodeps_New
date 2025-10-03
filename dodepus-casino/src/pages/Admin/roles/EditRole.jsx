import { Stack } from 'react-bootstrap';
import EditRolePermissions from './blocks/EditRole/EditRolePermissions.jsx';
import RolesMatrix from './blocks/RolesMatrix.jsx';

export default function EditRolePage() {
  return (
    <Stack gap={3}>
      <EditRolePermissions />
      <RolesMatrix />
    </Stack>
  );
}
