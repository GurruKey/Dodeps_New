import { useMemo, useState } from 'react';
import { Button, Card, Form, Stack, Table } from 'react-bootstrap';
import {
  rolePermissionMatrix,
  roleMatrixLegend,
} from '../../data/roleConfigs.js';

const permissionKeys = Object.keys(roleMatrixLegend);

export default function EditRolePermissions() {
  const [matrix, setMatrix] = useState(rolePermissionMatrix);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const selectedRole = useMemo(() => matrix[0], [matrix]);

  const handleToggle = (roleId, permissionKey) => {
    setMatrix((prev) =>
      prev.map((role) =>
        role.roleId === roleId
          ? {
              ...role,
              permissions: {
                ...role.permissions,
                [permissionKey]: !role.permissions[permissionKey],
              },
            }
          : role,
      ),
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    window.setTimeout(() => {
      setIsSaving(false);
      setLastSavedAt(new Date().toLocaleString('ru-RU'));
    }, 600);
  };

  return (
    <Card>
      <Card.Body>
        <Stack gap={3}>
          <div>
            <Card.Title as="h4" className="mb-1">
              Изменить роль
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Настройте, какие вкладки и функции доступны каждой роли. Отключённая вкладка скрывается
              и функционал становится недоступным.
            </Card.Text>
          </div>

          <div className="table-responsive">
            <Table striped hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ minWidth: 180 }}>Роль</th>
                  {permissionKeys.map((permissionKey) => (
                    <th key={permissionKey} className="text-center">
                      {roleMatrixLegend[permissionKey]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((role) => (
                  <tr key={role.roleId}>
                    <td className="fw-medium">{role.roleName}</td>
                    {permissionKeys.map((permissionKey) => (
                      <td key={permissionKey} className="text-center">
                        <Form.Check
                          type="switch"
                          id={`${role.roleId}-${permissionKey}`}
                          checked={role.permissions[permissionKey] ?? false}
                          onChange={() => handleToggle(role.roleId, permissionKey)}
                          label=""
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Сохраняем…' : 'Сохранить изменения'}
            </Button>
            {lastSavedAt && (
              <small className="text-muted">Последнее сохранение: {lastSavedAt}</small>
            )}
          </div>

          {selectedRole && (
            <Card className="bg-light border-0">
              <Card.Body>
                <Card.Subtitle className="fw-semibold mb-2 text-uppercase text-muted">
                  Подсказка
                </Card.Subtitle>
                <Card.Text className="mb-0">
                  Активные переключатели определяют видимость вкладок и доступ к действиям в панели.
                  Например, если отключить «{roleMatrixLegend.chat}» для «{selectedRole.roleName}», то
                  для этой роли исчезнут раздел чата и все инструменты модерации переписки.
                </Card.Text>
              </Card.Body>
            </Card>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}
