import { Button, Col, Form, Row } from 'react-bootstrap';

export default function TransactionsFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  methodFilter,
  onMethodChange,
  methodsOptions = [],
  filtersApplied,
  onReset,
  totalCount,
  filteredCount,
}) {
  return (
    <Form
      className="border rounded-3 p-3 bg-body-secondary"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Row className="g-3 align-items-end">
        <Col xs={12} md={4}>
          <Form.Label htmlFor="admin-transactions-search" className="fw-semibold small text-uppercase text-muted">
            Поиск
          </Form.Label>
          <Form.Control
            id="admin-transactions-search"
            placeholder="ID, пользователь, метод…"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </Col>
        <Col xs={12} md={2}>
          <Form.Label className="fw-semibold small text-uppercase text-muted">Тип</Form.Label>
          <Form.Select value={typeFilter} onChange={(event) => onTypeChange(event.target.value)}>
            <option value="all">Все</option>
            <option value="deposit">Пополнение</option>
            <option value="withdraw">Вывод</option>
            <option value="other">Прочее</option>
          </Form.Select>
        </Col>
        <Col xs={12} md={2}>
          <Form.Label className="fw-semibold small text-uppercase text-muted">Статус</Form.Label>
          <Form.Select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
            <option value="all">Все</option>
            <option value="success">Успешно</option>
            <option value="pending">В ожидании</option>
            <option value="failed">Ошибка</option>
          </Form.Select>
        </Col>
        <Col xs={12} md={3}>
          <Form.Label className="fw-semibold small text-uppercase text-muted">Метод</Form.Label>
          <Form.Select value={methodFilter} onChange={(event) => onMethodChange(event.target.value)}>
            <option value="all">Все</option>
            {methodsOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md="auto">
          <Button
            type="button"
            variant="outline-secondary"
            className="w-100"
            disabled={!filtersApplied}
            onClick={onReset}
          >
            Сбросить
          </Button>
        </Col>
      </Row>
      <div className="text-muted small mt-2">
        Показано {filteredCount} из {totalCount} операций
      </div>
    </Form>
  );
}
