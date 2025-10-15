import { Stack } from 'react-bootstrap';
import renderRoleEntry from './renderRoleEntry.jsx';

export default function renderEntries(entries) {
  if (!entries.length) {
    return <div className="text-muted text-center">Нет данных</div>;
  }

  return (
    <Stack gap={2} className="flex-grow-1">
      {entries.map(renderRoleEntry)}
    </Stack>
  );
}
