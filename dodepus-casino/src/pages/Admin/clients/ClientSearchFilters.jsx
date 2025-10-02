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
  { value: 'vip', label: 'VIP' },
  { value: 'review', label: 'На проверке' },
  { value: 'suspended', label: 'Заблокирован' },
];

export default function ClientSearchFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  balanceFilter,
  onBalanceChange,
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
      </Row>
    </Form>
  );
}
