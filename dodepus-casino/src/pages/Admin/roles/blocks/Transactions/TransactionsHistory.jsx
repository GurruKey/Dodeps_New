import { Badge, Card, Table } from 'react-bootstrap';
import { transactionHistory } from '../../data/roleConfigs.js';

const statusLabels = {
  completed: { label: 'Завершено', variant: 'success' },
  pending: { label: 'В обработке', variant: 'warning' },
  failed: { label: 'Ошибка', variant: 'danger' },
};

export default function TransactionsHistory() {
  return (
    <Card>
      <Card.Body>
        <Card.Title as="h4" className="mb-1">
          Транзакции
        </Card.Title>
        <Card.Text className="text-muted">
          Последние операции в кассе. Журнал обновляется в реальном времени.
        </Card.Text>

        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr>
                <th style={{ minWidth: 130 }}>Транзакция</th>
                <th style={{ minWidth: 100 }}>ID игрока</th>
                <th style={{ minWidth: 110 }}>Сумма</th>
                <th>Метод</th>
                <th style={{ minWidth: 130 }}>Статус</th>
                <th style={{ minWidth: 150 }}>Создана</th>
              </tr>
            </thead>
            <tbody>
              {transactionHistory.map((transaction) => {
                const status = statusLabels[transaction.status] ?? {
                  label: transaction.status,
                  variant: 'secondary',
                };
                return (
                  <tr key={transaction.id}>
                    <td className="fw-medium">{transaction.id}</td>
                    <td>{transaction.user}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.method}</td>
                    <td>
                      <Badge bg={status.variant}>{status.label}</Badge>
                    </td>
                    <td>{transaction.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}
