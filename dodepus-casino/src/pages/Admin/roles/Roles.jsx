import { Card, Stack } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import RolesMatrix from './blocks/RolesMatrix.jsx';

export default function Roles() {
  const { isLoading } = useOutletContext() ?? {};

  return (
    <Stack gap={3}>
      <Card>
        <Card.Body>
          <Card.Title as="h3" className="mb-1">
            Роли и права доступа
          </Card.Title>
          <Card.Text className="text-muted mb-0">
            Конструктор ролей ещё в разработке. Пока отображаем статичную матрицу для согласования
            требований. {isLoading ? 'Синхронизация с данными выполняется…' : ''}
          </Card.Text>
        </Card.Body>
      </Card>

      <RolesMatrix />
    </Stack>
  );
}
