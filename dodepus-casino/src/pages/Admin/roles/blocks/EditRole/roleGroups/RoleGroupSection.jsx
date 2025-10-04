import { Accordion, Badge, Card, Form, Stack } from 'react-bootstrap';

export default function RoleGroupSection({
  roles,
  permissionKeys,
  roleMatrixLegend,
  expandedRoles,
  onToggleRole,
  onRequestPermissionToggle,
}) {
  if (!roles || roles.length === 0) {
    return (
      <Card className="bg-light border-0">
        <Card.Body className="py-4 text-center text-muted">
          Нет доступных ролей в выбранной группе.
        </Card.Body>
      </Card>
    );
  }

  return (
    <Accordion
      activeKey={expandedRoles}
      alwaysOpen
      onSelect={(eventKey) => onToggleRole?.(eventKey)}
      className="border rounded"
    >
      {roles.map((role) => {
        const roleDescription = role.meta?.description ?? '';
        const roleLevel = typeof role.meta?.level === 'number' ? role.meta.level : null;

        return (
          <Accordion.Item eventKey={role.roleId} key={role.roleId}>
            <Accordion.Header>
              <div className="d-flex flex-column flex-md-row w-100 align-items-md-center">
                <span className="fw-semibold me-md-3">{role.roleName}</span>
                {roleLevel && (
                  <Badge bg="secondary" className="mt-2 mt-md-0">
                    lvl {roleLevel}
                  </Badge>
                )}
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <Stack gap={3}>
                {roleDescription && (
                  <Card.Text className="text-muted mb-0">{roleDescription}</Card.Text>
                )}
                <div className="d-grid gap-3">
                  {permissionKeys.map((permissionKey) => (
                    <Form.Check
                      key={permissionKey}
                      type="switch"
                      id={`${role.roleId}-${permissionKey}`}
                      checked={role.permissions[permissionKey] ?? false}
                      onChange={(event) =>
                        onRequestPermissionToggle?.(event, role, permissionKey)
                      }
                      label={
                        <span className="d-flex flex-column text-start">
                          <span className="fw-semibold">{roleMatrixLegend[permissionKey]}</span>
                          <small className="text-muted">
                            {role.permissions[permissionKey]
                              ? 'Доступ включён'
                              : 'Доступ отключён'}
                          </small>
                        </span>
                      }
                    />
                  ))}
                </div>
              </Stack>
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}
