import { Form, Row, Col } from 'react-bootstrap';

const balanceOptions = [
  { value: 'all', label: 'Все балансы' },
  { value: 'positive', label: 'Положительный баланс' },
  { value: 'zero', label: 'Нулевой баланс' },
  { value: 'negative', label: 'Отрицательный баланс' },
];

const statusOptions = [
  { value: 'all', label: 'Все статусы' },
  { value: 'active', label: 'Активный' },
  { value: 'ban', label: 'Бан' },
];

const roleOptions = [
  { value: 'all', label: 'Все роли' },
  { value: 'user', label: 'User' },
  { value: 'intern:1', label: 'Ст_1_lvl' },
  { value: 'intern:2', label: 'Ст_2_lvl' },
  { value: 'intern:3', label: 'Ст_3_lvl' },
  { value: 'intern:4', label: 'Ст_4_lvl' },
  { value: 'moderator:1', label: 'Мод_1_lvl' },
  { value: 'moderator:2', label: 'Мод_2_lvl' },
  { value: 'moderator:3', label: 'Мод_3_lvl' },
  { value: 'moderator:4', label: 'Мод_4_lvl' },
  { value: 'admin:1', label: 'Админ_1_lvl' },
  { value: 'admin:2', label: 'Админ_2_lvl' },
  { value: 'admin:3', label: 'Админ_3_lvl' },
  { value: 'admin:4', label: 'Админ_4_lvl' },
  { value: 'owner', label: 'Owner' },
];

export default function ClientSearchFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  balanceFilter,
  onBalanceChange,
  roleFilter,
  onRoleChange,
}) {
  return (
    <Form>
      <Row className="g-3">
        <Col xs={12} lg={6}>
          <Form.Group controlId="clientSearch">
            <Form.Label>Поиск</Form.Label>
            <Form.Control
              type="search"
              placeholder="Поиск по ID, e-mail или телефону"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </Form.Group>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Form.Group controlId="clientStatus">
            <Form.Label>Статус</Form.Label>
            <Form.Select
              value={statusFilter}
              onChange={(event) => onStatusChange(event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Form.Group controlId="clientBalance">
            <Form.Label>Баланс</Form.Label>
            <Form.Select
              value={balanceFilter}
              onChange={(event) => onBalanceChange(event.target.value)}
            >
              {balanceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Form.Group controlId="clientRole">
            <Form.Label>Роль</Form.Label>
            <Form.Select value={roleFilter} onChange={(event) => onRoleChange(event.target.value)}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
}
