import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Alert, Button, Card, Col, Form, InputGroup, Row, Stack, } from 'react-bootstrap';
import { listAvailableAdminRoles } from '@local-sim/modules/access/index.js';
import { assignUserRole } from '@/features/auth/index.js';

const availableRoles = listAvailableAdminRoles();
const idPlaceholderExamples = ['ID-10192', 'ID-20204', 'ID-30881'];

export default function AssignRole({ statusMessage = '' }) {
  const [searchId, setSearchId] = useState('');
  const [selectedRole, setSelectedRole] = useState(availableRoles[0]?.id ?? '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastIssuedRole, setLastIssuedRole] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { onReload } = useOutletContext() ?? {};

  const placeholder = useMemo(() => {
    const index = Math.floor(Math.random() * idPlaceholderExamples.length);
    return `Например: ${idPlaceholderExamples[index]}`;
  }, []);

  const selectedRoleConfig = useMemo(
    () => availableRoles.find((role) => role.id === selectedRole) ?? null,
    [selectedRole]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedId = searchId.trim();
    if (!trimmedId || !selectedRole) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const updatedUser = await assignUserRole({
        userId: trimmedId,
        roleId: selectedRole,
      });

      const roleConfig = selectedRoleConfig;
      setLastIssuedRole({
        userId: updatedUser?.id ?? trimmedId,
        roleName: roleConfig?.name ?? roleConfig?.id ?? selectedRole,
        roleGroup: roleConfig?.group ?? updatedUser?.role ?? null,
        roleLevel:
          typeof roleConfig?.level === 'number'
            ? roleConfig.level
            : typeof updatedUser?.roleLevel === 'number'
            ? updatedUser.roleLevel
            : null,
        issuedAt: new Date().toLocaleString('ru-RU'),
      });

      if (typeof onReload === 'function') {
        onReload();
      }
    } catch (error) {
      setLastIssuedRole(null);
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось назначить роль.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <Card.Body as={Form} onSubmit={handleSubmit}>
        <Stack gap={3}>
          <div>
            <Card.Title as="h4" className="mb-1">
              Выдать роль
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Найдите сотрудника по внутреннему ID и закрепите новую роль. {statusMessage}
            </Card.Text>
          </div>

          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Label htmlFor="assign-user-id" className="fw-medium">
                ID сотрудника
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>#</InputGroup.Text>
                <Form.Control
                  id="assign-user-id"
                  value={searchId}
                  onChange={(event) => setSearchId(event.target.value)}
                  placeholder={placeholder}
                  autoComplete="off"
                />
              </InputGroup>
              <Form.Text>Поддерживается поиск только по точному совпадению ID.</Form.Text>
            </Col>

            <Col xs={12} md={6}>
              <Form.Label htmlFor="assign-role" className="fw-medium">
                Новая роль
              </Form.Label>
              <Form.Select
                id="assign-role"
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
              >
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text>
                {selectedRoleConfig?.description ?? ''}
              </Form.Text>
            </Col>
          </Row>

          <div className="d-flex flex-wrap gap-2">
            <Button type="submit" disabled={isProcessing || !searchId.trim()}>
              {isProcessing ? 'Выдаём…' : 'Выдать роль'}
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setSearchId('');
                setSelectedRole(availableRoles[0]?.id ?? '');
                setErrorMessage('');
                setLastIssuedRole(null);
              }}
              disabled={isProcessing}
            >
              Сбросить
            </Button>
          </div>

          {errorMessage && (
            <Alert variant="danger" className="mb-0">
              {errorMessage}
            </Alert>
          )}

          {lastIssuedRole && (
            <Card className="border-0 surface-card">
              <Card.Body className="py-3">
                <strong>{lastIssuedRole.userId}</strong> получил роль «{lastIssuedRole.roleName}»{' '}
                <span className="text-muted">{lastIssuedRole.issuedAt}</span>
              </Card.Body>
            </Card>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}
