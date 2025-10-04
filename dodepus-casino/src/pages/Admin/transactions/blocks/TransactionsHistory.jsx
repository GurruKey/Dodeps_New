import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';

import {
  listAdminTransactions,
  subscribeToAdminTransactions,
} from '../../../../../local-sim/admin/transactions';

const STATUS_VARIANTS = {
  success: { label: 'Успешно', variant: 'success' },
  pending: { label: 'В ожидании', variant: 'warning' },
  failed: { label: 'Ошибка', variant: 'danger' },
};

const TYPE_VARIANTS = {
  deposit: { label: 'Пополнение', variant: 'success' },
  withdraw: { label: 'Вывод', variant: 'danger' },
  other: { label: 'Прочее', variant: 'secondary' },
};

const METHOD_LABELS = {
  card: 'Карта',
  bank: 'Банковский перевод',
  crypto: 'Криптовалюта',
  other: 'Другое',
};

const normalizeMethodValue = (method) => {
  const normalized = typeof method === 'string' ? method.trim().toLowerCase() : '';
  return normalized || 'other';
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
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
        if (!isMountedRef.current) {
          return;
        }

        setTransactions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (err?.name === 'AbortError') {
          return;
        }
        if (!isMountedRef.current) {
          return;
        }

        const normalizedError =
          err instanceof Error ? err : new Error('Не удалось загрузить транзакции');
        setError(normalizedError);
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
      if (typeof event?.key !== 'string') {
        return;
      }
      if (!event.key.startsWith('dodepus_profile_v1:')) {
        return;
      }

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

  const filtersApplied = Boolean(
    search.trim() || typeFilter !== 'all' || statusFilter !== 'all' || methodFilter !== 'all',
  );

  const methodsOptions = useMemo(() => {
    const optionsMap = new Map();
    transactions.forEach((transaction) => {
      const key = normalizeMethodValue(transaction.method);
      if (!optionsMap.has(key)) {
        const label = METHOD_LABELS[key] ?? formatMethod(transaction.method);
        optionsMap.set(key, label);
      }
    });

    return Array.from(optionsMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' }));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      if (typeFilter !== 'all' && transaction.type !== typeFilter) {
        return false;
      }

      if (statusFilter !== 'all' && transaction.status !== statusFilter) {
        return false;
      }

      if (methodFilter !== 'all' && normalizeMethodValue(transaction.method) !== methodFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        transaction.id,
        transaction.userId,
        transaction.userEmail,
        transaction.userNickname,
        transaction.currency,
        formatMethod(transaction.method),
        TYPE_VARIANTS[transaction.type]?.label,
        STATUS_VARIANTS[transaction.status]?.label,
        Number.isFinite(Number(transaction.amount)) ? String(transaction.amount) : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [transactions, search, typeFilter, statusFilter, methodFilter]);

  const totalsByCurrency = useMemo(() => {
    const map = new Map();

    transactions.forEach((transaction) => {
      const currency =
        typeof transaction.currency === 'string' && transaction.currency.trim()
          ? transaction.currency.trim().toUpperCase()
          : 'USD';
      const amount = Number.isFinite(Number(transaction.amount))
        ? Math.abs(Number(transaction.amount))
        : 0;

      if (!map.has(currency)) {
        map.set(currency, {
          currency,
          depositTotal: 0,
          withdrawTotal: 0,
          depositCount: 0,
          withdrawCount: 0,
        });
      }

      const entry = map.get(currency);
      if (transaction.type === 'withdraw') {
        entry.withdrawTotal += amount;
        entry.withdrawCount += 1;
      } else {
        entry.depositTotal += amount;
        entry.depositCount += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.currency.localeCompare(b.currency));
  }, [transactions]);

  const renderBodyRows = (rows = transactions) => {
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

  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between mb-3">
          <div>
            <Card.Title as="h4" className="mb-1">
              История транзакций
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Просматривайте операции в реальном времени. Данные синхронизируются автоматически при изменениях.
            </Card.Text>
          </div>
          <div className="d-flex align-items-center gap-2">
            {loading && transactions.length > 0 ? <Spinner animation="border" role="status" size="sm" /> : null}
            <Button variant="outline-primary" onClick={handleManualReload} disabled={loading}>
              Обновить
            </Button>
          </div>
        </div>

        {error ? (
          <Alert variant="danger" className="mb-3">
            Не удалось обновить список транзакций: {error.message}
          </Alert>
        ) : null}

        <div className="d-flex flex-column gap-3 mb-4">
          {totalsByCurrency.length ? (
            <Row className="g-3">
              {totalsByCurrency.map((item) => (
                <Col key={item.currency} xs={12} md={6} xl={4}>
                  <div className="border rounded-3 p-3 h-100 bg-light-subtle">
                    <div className="text-uppercase text-muted fw-semibold small">{item.currency}</div>
                    <div className="d-flex flex-column gap-2 mt-2">
                      <div>
                        <div className="text-muted small">Пополнения</div>
                        <div className="fw-semibold">{formatCurrency(item.depositTotal, item.currency)}</div>
                        <div className="text-muted small">{item.depositCount || 0} операций</div>
                      </div>
                      <div>
                        <div className="text-muted small">Выводы</div>
                        <div className="fw-semibold">{formatCurrency(item.withdrawTotal, item.currency)}</div>
                        <div className="text-muted small">{item.withdrawCount || 0} операций</div>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : null}

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
                  onChange={(event) => setSearch(event.target.value)}
                />
              </Col>
              <Col xs={12} md={2}>
                <Form.Label className="fw-semibold small text-uppercase text-muted">Тип</Form.Label>
                <Form.Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                  <option value="all">Все</option>
                  <option value="deposit">Пополнение</option>
                  <option value="withdraw">Вывод</option>
                  <option value="other">Прочее</option>
                </Form.Select>
              </Col>
              <Col xs={12} md={2}>
                <Form.Label className="fw-semibold small text-uppercase text-muted">Статус</Form.Label>
                <Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">Все</option>
                  <option value="success">Успешно</option>
                  <option value="pending">В ожидании</option>
                  <option value="failed">Ошибка</option>
                </Form.Select>
              </Col>
              <Col xs={12} md={3}>
                <Form.Label className="fw-semibold small text-uppercase text-muted">Метод</Form.Label>
                <Form.Select value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)}>
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
                  variant="outline-secondary"
                  className="w-100"
                  disabled={!filtersApplied}
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setMethodFilter('all');
                  }}
                >
                  Сбросить
                </Button>
              </Col>
            </Row>
            <div className="text-muted small mt-2">
              Показано {filteredTransactions.length} из {transactions.length} операций
            </div>
          </Form>
        </div>

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
              {(() => {
                if (!loading && filteredTransactions.length === 0 && transactions.length > 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-muted">
                        Не найдено транзакций по заданным фильтрам.
                      </td>
                    </tr>
                  );
                }

                return renderBodyRows(filteredTransactions);
              })()}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}
