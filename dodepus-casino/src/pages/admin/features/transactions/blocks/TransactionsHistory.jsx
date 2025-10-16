import { useCallback, useMemo, useState } from 'react';
import { Alert, Button, Card, Spinner } from 'react-bootstrap';

import TransactionsFilters from '../components/TransactionsFilters.jsx';
import TransactionsSummary from '../components/TransactionsSummary.jsx';
import TransactionsTable from '../components/TransactionsTable.jsx';
import { METHOD_LABELS, STATUS_VARIANTS, TYPE_VARIANTS } from '../constants.js';
import { formatMethod, normalizeMethodValue } from '../utils.js';
import { useAdminTransactions } from '../hooks/useAdminTransactions.js';
import { useAuth } from '../../../../../app/providers';
import { appendAdminLog } from '../../../../../../local-sim/modules/logs/index.js';

const TRANSACTIONS_VIEW_CONTEXT = 'transactions-view';

const getAdminDisplayName = (user) => {
  const fullName = [user?.firstName, user?.lastName]
    .filter((part) => typeof part === 'string' && part.trim())
    .join(' ')
    .trim();

  if (fullName) {
    return fullName;
  }

  if (typeof user?.nickname === 'string' && user.nickname.trim()) {
    return user.nickname.trim();
  }

  if (typeof user?.email === 'string' && user.email.trim()) {
    return user.email.trim();
  }

  return 'Неизвестный админ';
};

const getAdminRole = (user) => {
  if (typeof user?.role === 'string' && user.role.trim()) {
    return user.role.trim();
  }

  if (Array.isArray(user?.roles) && user.roles.length) {
    const candidate = user.roles.find((role) => typeof role === 'string' && role.trim());
    if (candidate) {
      return candidate.trim();
    }
  }

  return 'admin';
};

const getAdminId = (user) => {
  if (typeof user?.id === 'string' && user.id.trim()) {
    return user.id.trim();
  }

  return 'UNKNOWN';
};

const buildViewLogDetails = (user) => ({
  section: 'transactions',
  action: 'Запросил просмотр истории транзакций',
  adminId: getAdminId(user),
  adminName: getAdminDisplayName(user),
  role: getAdminRole(user),
  context: TRANSACTIONS_VIEW_CONTEXT,
});

export default function TransactionsHistory() {
  const { user } = useAuth();
  const { transactions, loading, error, reload, activate, isActivated } = useAdminTransactions();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

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

  const handleManualReload = useCallback(() => {
    reload().catch(() => {});
  }, [reload]);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
    setMethodFilter('all');
  }, []);

  const handleViewClick = useCallback(() => {
    try {
      appendAdminLog(buildViewLogDetails(user));
    } catch (err) {
      console.warn('Не удалось записать лог просмотра транзакций', err);
    }

    const maybePromise = activate();
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => {});
    }
  }, [activate, user]);

  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between mb-3">
          <div>
            <Card.Title as="h4" className="mb-1">
              История транзакций
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Загрузите и обновляйте список операций аккаунтов вручную при необходимости.
            </Card.Text>
          </div>
          {isActivated ? (
            <div className="d-flex align-items-center gap-2">
              {loading && transactions.length > 0 ? (
                <Spinner animation="border" role="status" size="sm" />
              ) : null}
              <Button variant="outline-primary" onClick={handleManualReload} disabled={loading}>
                Обновить
              </Button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Button variant="primary" onClick={handleViewClick} disabled={loading}>
                {loading ? (
                  <span className="d-inline-flex align-items-center gap-2">
                    <Spinner animation="border" role="status" size="sm" />
                    Загрузка…
                  </span>
                ) : (
                  'Просмотреть транзакции'
                )}
              </Button>
            </div>
          )}
        </div>

        {!isActivated ? (
          <Alert variant="info" className="mb-4">
            История транзакций будет загружена после нажатия кнопки «Просмотреть транзакции».
          </Alert>
        ) : null}

        {isActivated ? (
          <>
            {error ? (
              <Alert variant="danger" className="mb-3">
                Не удалось обновить список транзакций: {error.message}
              </Alert>
            ) : null}

            <div className="d-flex flex-column gap-3 mb-4">
              <TransactionsSummary totals={totalsByCurrency} />
              <TransactionsFilters
                search={search}
                onSearchChange={setSearch}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                methodFilter={methodFilter}
                onMethodChange={setMethodFilter}
                methodsOptions={methodsOptions}
                filtersApplied={filtersApplied}
                onReset={handleResetFilters}
                totalCount={transactions.length}
                filteredCount={filteredTransactions.length}
              />
            </div>

            <TransactionsTable
              transactions={transactions}
              filteredTransactions={filteredTransactions}
              loading={loading}
            />
          </>
        ) : (
          <div className="py-5 text-center text-muted">
            Нажмите «Просмотреть транзакции», чтобы загрузить текущую историю операций и включить обновления.
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
