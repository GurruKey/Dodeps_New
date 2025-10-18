import { Badge, Spinner, Table } from 'react-bootstrap';

import {
  STATUS_VARIANTS,
  TYPE_VARIANTS,
  formatAmount,
  formatDateTime,
  formatMethod,
} from '../shared/index.js';

export default function TransactionsTable({ transactions, filteredTransactions, loading }) {
  const renderRows = (rows) => {
    if (loading && transactions.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="py-4 text-center">
            <Spinner animation="border" role="status" />
          </td>
        </tr>
      );
    }

    if (!loading && transactions.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="py-4 text-center text-muted">
            Нет доступных транзакций.
          </td>
        </tr>
      );
    }

    return rows.map((transaction) => {
      const status = STATUS_VARIANTS[transaction.status] ?? {
        label: transaction.status,
        variant: 'secondary',
      };
      const type = TYPE_VARIANTS[transaction.type] ?? TYPE_VARIANTS.other;
      const isWithdraw = transaction.type === 'withdraw';
      const userName = transaction.userId || '—';
      const userDetails = transaction.userEmail || transaction.userNickname || '—';
      const amountClassName = ['text-end', 'fw-semibold', isWithdraw ? 'text-danger' : 'text-success']
        .filter(Boolean)
        .join(' ');
      const entryKey = transaction.entryId ?? transaction.id ?? `${transaction.createdAt}-${transaction.type}`;

      return (
        <tr key={entryKey}>
          <td className="fw-medium text-nowrap">
            <code>{transaction.id}</code>
          </td>
          <td>
            <div className="fw-semibold">{userName}</div>
            <div className="text-muted small text-truncate" title={userDetails}>
              {userDetails}
            </div>
          </td>
          <td>
            <div className="d-flex flex-column gap-1">
              <Badge bg={type.variant}>{type.label}</Badge>
              <span className="text-muted small">{formatMethod(transaction.method)}</span>
            </div>
          </td>
          <td className={amountClassName}>{formatAmount(transaction)}</td>
          <td>
            <Badge bg={status.variant}>{status.label}</Badge>
          </td>
          <td className="text-nowrap">{formatDateTime(transaction.createdAt)}</td>
        </tr>
      );
    });
  };

  const showFilteredEmpty = !loading && filteredTransactions.length === 0 && transactions.length > 0;

  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0">
        <thead>
          <tr>
            <th style={{ minWidth: 130 }}>ID</th>
            <th style={{ minWidth: 160 }}>Пользователь</th>
            <th style={{ minWidth: 150 }}>Тип</th>
            <th style={{ minWidth: 140 }} className="text-end">
              Сумма
            </th>
            <th style={{ minWidth: 130 }}>Статус</th>
            <th style={{ minWidth: 150 }}>Создана</th>
          </tr>
        </thead>
        <tbody>
          {showFilteredEmpty ? (
            <tr>
              <td colSpan={6} className="py-4 text-center text-muted">
                Не найдено транзакций по заданным фильтрам.
              </td>
            </tr>
          ) : (
            renderRows(filteredTransactions)
          )}
        </tbody>
      </Table>
    </div>
  );
}
