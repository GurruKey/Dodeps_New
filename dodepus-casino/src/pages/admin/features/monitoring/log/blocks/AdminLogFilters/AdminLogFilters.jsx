import { Card, Form, Stack, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

export default function AdminLogFilters({
  search,
  onSearchChange,
  section,
  onSectionChange,
  role,
  onRoleChange,
  sectionOptions,
  roleOptions,
}) {
  return (
    <Card>
      <Card.Body>
        <Card.Title as="h3" className="mb-3">
          Фильтры
        </Card.Title>
        <Card.Text className="text-muted mb-4">
          Настройте поиск по вкладкам панели, ролям и идентификатору события.
        </Card.Text>

        <Stack gap={3}>
          <Form.Group controlId="admin-log-search">
            <Form.Label>Поиск по ID</Form.Label>
            <Form.Control
              type="search"
              placeholder="Введите идентификатор лога"
              value={search}
              onChange={(event) => onSearchChange?.(event.target.value)}
            />
          </Form.Group>

          <div>
            <Form.Label className="d-block mb-2">Фильтр по вкладкам</Form.Label>
            <ToggleButtonGroup
              type="radio"
              name="admin-log-section"
              value={section}
              onChange={(value) => onSectionChange?.(value)}
            >
              {sectionOptions.map((option) => (
                <ToggleButton
                  key={option.value}
                  id={`admin-log-section-${option.value}`}
                  value={option.value}
                  variant={section === option.value ? 'primary' : 'outline-primary'}
                >
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>

          <div>
            <Form.Label className="d-block mb-2">Фильтр по ролям</Form.Label>
            <ToggleButtonGroup
              type="radio"
              name="admin-log-role"
              value={role}
              onChange={(value) => onRoleChange?.(value)}
            >
              {roleOptions.map((option) => (
                <ToggleButton
                  key={option.value}
                  id={`admin-log-role-${option.value}`}
                  value={option.value}
                  variant={role === option.value ? 'secondary' : 'outline-secondary'}
                >
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
        </Stack>
      </Card.Body>
    </Card>
  );
}
