import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Stack,
} from 'react-bootstrap';
import { availableRoles } from '../../data/roleConfigs.js';

const idPlaceholderExamples = ['ID-10192', 'ID-20204', 'ID-30881'];

export default function AssignRole() {
  const [searchId, setSearchId] = useState('');
  const [selectedRole, setSelectedRole] = useState(availableRoles[0]?.id ?? '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastIssuedRole, setLastIssuedRole] = useState(null);

  const placeholder = useMemo(() => {
    const index = Math.floor(Math.random() * idPlaceholderExamples.length);
    return `Например: ${idPlaceholderExamples[index]}`;
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!searchId.trim() || !selectedRole) return;

    setIsProcessing(true);
    window.setTimeout(() => {
      const roleName = availableRoles.find((role) => role.id === selectedRole)?.name ?? selectedRole;
      setLastIssuedRole({
        userId: searchId.trim(),
        roleName,
        issuedAt: new Date().toLocaleString('ru-RU'),
      });
      setIsProcessing(false);
    }, 550);
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
              Найдите сотрудника по внутреннему ID и закрепите новую роль.
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
                {availableRoles.find((role) => role.id === selectedRole)?.description ?? ''}
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
              }}
              disabled={isProcessing}
            >
              Сбросить
            </Button>
          </div>

          {lastIssuedRole && (
            <Card className="bg-light border-0">
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
