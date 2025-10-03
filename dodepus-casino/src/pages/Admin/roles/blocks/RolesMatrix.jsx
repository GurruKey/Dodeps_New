import { Badge, Card, Table } from 'react-bootstrap';
import {
  rolePermissionMatrix,
  roleMatrixLegend,
} from '../data/roleConfigs.js';

export default function RolesMatrix() {
  const permissionKeys = Object.keys(roleMatrixLegend);

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
            {rolePermissionMatrix.map((role) => (
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
