import { Stack } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import { AssignRole, RolesMatrix } from './blocks/index.js';

export default function Roles() {
  const { isLoading } = useOutletContext() ?? {};

  return (
    <Stack gap={3}>
      <AssignRole statusMessage={isLoading ? 'Синхронизация с данными выполняется…' : ''} />
      <RolesMatrix />
    </Stack>
  );
}
