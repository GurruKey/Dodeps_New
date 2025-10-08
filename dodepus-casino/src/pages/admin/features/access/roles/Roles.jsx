import { Stack } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import RolesMatrix from './blocks/RolesMatrix.jsx';
import AssignRole from './blocks/AssignRole/AssignRole.jsx';

export default function Roles() {
  const { isLoading } = useOutletContext() ?? {};

  return (
    <Stack gap={3}>
      <AssignRole statusMessage={isLoading ? 'Синхронизация с данными выполняется…' : ''} />
      <RolesMatrix />
    </Stack>
  );
}
