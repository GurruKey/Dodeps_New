import { useEffect, useMemo, useState } from 'react';
import { Badge, Card, Table } from 'react-bootstrap';
import {
  rolePermissionMatrix,
  roleMatrixLegend,
} from '../data/roleConfigs.js';
import {
  ADMIN_PANEL_VISIBILITY_EVENT,
  loadAdminPanelVisibility,
} from '../../../../../local-sim/auth/admin/adminPanelVisibility';

export default function RolesMatrix() {
  const permissionKeys = Object.keys(roleMatrixLegend);
  const [adminVisibility, setAdminVisibility] = useState(() => loadAdminPanelVisibility());

  useEffect(() => {
    const target = typeof window !== 'undefined' ? window : globalThis;
    if (!target?.addEventListener) return undefined;

    const handleVisibilityChange = (event) => {
      const next = event?.detail?.visibility;
      if (next && typeof next === 'object') {
        setAdminVisibility((prev) => ({ ...prev, ...next }));
      } else {
        setAdminVisibility(loadAdminPanelVisibility());
      }
    };

    target.addEventListener(ADMIN_PANEL_VISIBILITY_EVENT, handleVisibilityChange);
    return () => {
      target.removeEventListener(ADMIN_PANEL_VISIBILITY_EVENT, handleVisibilityChange);
    };
  }, []);

  const matrix = useMemo(
    () =>
      rolePermissionMatrix.map((role) => ({
        ...role,
        permissions: {
          ...role.permissions,
          adminPanel:
            adminVisibility[role.roleId] ?? role.permissions.adminPanel ?? false,
        },
      })),
    [adminVisibility]
  );

  return (
    <Card>
      <Card.Body>
        <Card.Title>Матрица ролей</Card.Title>
        <Card.Text className="text-muted">
          Предпросмотр того, какие разделы панели доступны каждой роли.
        </Card.Text>
        <Table responsive hover className="mb-0 align-middle text-center">
          <thead>
            <tr>
              <th className="text-start" style={{ minWidth: 180 }}>Роль</th>
              {permissionKeys.map((permissionKey) => (
                <th key={permissionKey}>{roleMatrixLegend[permissionKey]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((role) => (
              <tr key={role.roleId}>
                <td className="text-start fw-medium">{role.roleName}</td>
                {permissionKeys.map((permissionKey) => (
                  <td key={permissionKey}>
                    {role.permissions[permissionKey] ? (
                      <Badge bg="success">Доступно</Badge>
                    ) : (
                      <Badge bg="secondary">Нет</Badge>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
