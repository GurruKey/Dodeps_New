import { Form, Row, Col } from 'react-bootstrap';
import { getRoleOptions, getStatusOptions } from '../../../../local-sim/admin/filters';

const balanceOptions = [
  { value: 'all', label: 'Все балансы' },
  { value: 'positive', label: 'Положительный баланс' },
  { value: 'zero', label: 'Нулевой баланс' },
  { value: 'negative', label: 'Отрицательный баланс' },
];

const statusLabelMap = {
  active: 'Активный',
  ban: 'Бан',
};

const statusOptions = getStatusOptions({
  allLabel: 'Все статусы',
  formatLabel: (status) => statusLabelMap[status] ?? status,
});

const rolePrefixMap = {
  intern: 'Ст',
  moderator: 'Мод',
  admin: 'Админ',
};

const roleFallbackLabels = {
  owner: 'Owner',
  user: 'User',
};

const roleOptions = getRoleOptions({
  allLabel: 'Все роли',
  formatLabel: (role) => {
    if (role.level != null) {
      const prefix = rolePrefixMap[role.group] ?? role.group;
      return `${prefix}_${role.level}_lvl`;
    }

    return roleFallbackLabels[role.group] ?? role.group;
  },
});

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
