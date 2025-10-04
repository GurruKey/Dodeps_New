import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Card, Spinner, Table } from 'react-bootstrap';

import {
  listAdminTransactions,
  subscribeToAdminTransactions,
} from '../../../../../local-sim/admin/transactions';

const STATUS_VARIANTS = {
  success: { label: '???????', variant: 'success' },
  pending: { label: '? ????????', variant: 'warning' },
  failed: { label: '??????', variant: 'danger' },
};

const TYPE_VARIANTS = {
  deposit: { label: '??????????', variant: 'success' },
  withdraw: { label: '?????', variant: 'danger' },
  other: { label: '????????', variant: 'secondary' },
};

const METHOD_LABELS = {
  card: '?????',
  bank: '?????????? ???????',
  crypto: '????????????',
  other: '??????',
};

const formatCurrency = (value, currency) => {
  const amount = Number.isFinite(Number(value)) ? Math.abs(Number(value)) : 0;
  const normalizedCurrency = typeof currency === 'string' && currency.trim() ? currency.trim() : 'USD';

  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: normalizedCurrency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${normalizedCurrency}`.trim();
  }
};

const formatAmount = (transaction) => {
  const sign = transaction.type === 'withdraw' ? '-' : '+';
  return `${sign}${formatCurrency(transaction.amount, transaction.currency)}`;
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMethod = (method) => {
  const normalized = typeof method === 'string' ? method.trim().toLowerCase() : '';
  if (!normalized) return '—';
  return METHOD_LABELS[normalized] ?? method;
};

export default function TransactionsHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  const loadTransactions = useCallback(
    async ({ signal, silent = false } = {}) => {
      if (!silent && isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const params = {};
      if (signal) {
        params.signal = signal;
      }

      try {
        const data = await listAdminTransactions(params);
        if (!isMountedRef.current) return;
        setTransactions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (err?.name === 'AbortError') return;
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err : new Error('?? ??????? ????????? ??????????'));
      } finally {
        if (!silent && isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadTransactions({ signal: controller.signal }).catch(() => {});

    return () => {
      controller.abort();
    };
  }, [loadTransactions]);

  useEffect(() => {
    const unsubscribe = subscribeToAdminTransactions(() => {
      loadTransactions({ silent: true }).catch(() => {});
    });

    const target = typeof window !== 'undefined' ? window : null;
    if (!target?.addEventListener) {
      return unsubscribe;
    }

    const handleStorage = (event) => {
      if (typeof event?.key !== 'string') return;
      if (!event.key.startsWith('dodepus_profile_v1:')) return;
      loadTransactions({ silent: true }).catch(() => {});
    };

    target.addEventListener('storage', handleStorage);
    return () => {
      unsubscribe();
      target.removeEventListener('storage', handleStorage);
    };
  }, [loadTransactions]);

  const handleManualReload = useCallback(() => {
    loadTransactions().catch(() => {});
  }, [loadTransactions]);

  const renderBodyRows = () => {
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
            ??? ??? ????????.
          </td>
        </tr>
      );
    }

    return transactions.map((transaction) => {
      const status = STATUS_VARIANTS[transaction.status] ?? {
        label: transaction.status,
        variant: 'secondary',
      };
      const type = TYPE_VARIANTS[transaction.type] ?? TYPE_VARIANTS.other;
      const isWithdraw = transaction.type === 'withdraw';

      return (
        <tr key={transaction.entryId}>
          <td className="fw-medium text-nowrap">
            <code>{transaction.id}</code>
          </td>
          <td>
            <div className="fw-semibold">{transaction.userId}</div>
            <div className="text-muted small text-truncate" title={transaction.userEmail || transaction.userNickname}>
              {transaction.userEmail || transaction.userNickname || '—'}
            </div>
          </td>
          <td>
            <div className="d-flex flex-column gap-1">
              <Badge bg={type.variant}>{type.label}</Badge>
              <span className="text-muted small">{formatMethod(transaction.method)}</span>
            </div>
          </td>
          <td className={	ext-end fw-semibold }>
            {formatAmount(transaction)}
          </td>
          <td>
            <Badge bg={status.variant}>{status.label}</Badge>
          </td>
          <td className="text-nowrap">{formatDateTime(transaction.createdAt)}</td>
        </tr>
      );
    });
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between mb-3">
          <div>
            <Card.Title as="h4" className="mb-1">
              ??????????
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              ????????? ???????? ? ?????. ?????? ??????????? ? ???????? ???????.
            </Card.Text>
          </div>
          <div className="d-flex align-items-center gap-2">
            {loading && transactions.length > 0 ? <Spinner animation="border" role="status" size="sm" /> : null}
            <Button variant="outline-primary" onClick={handleManualReload} disabled={loading}>
              ????????
            </Button>
          </div>
        </div>

        {error ? (
          <Alert variant="danger" className="mb-3">
            ?? ??????? ????????? ????????: {error.message}
          </Alert>
        ) : null}

        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr>
                <th style={{ minWidth: 130 }}>ID</th>
                <th style={{ minWidth: 160 }}>??????</th>
                <th style={{ minWidth: 150 }}>???</th>
                <th style={{ minWidth: 140 }} className="text-end">
                  ?????
                </th>
                <th style={{ minWidth: 130 }}>??????</th>
                <th style={{ minWidth: 150 }}>???????</th>
              </tr>
            </thead>
            <tbody>{renderBodyRows()}</tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}







