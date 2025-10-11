import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { formatDateTime } from '../utils.js';

const formatBalance = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '0,00';
  }

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
};

export default function VerificationIdleAccountsModal({
  show = false,
  onClose,
  accounts = [],
  loading = false,
  error = null,
  onReload,
}) {
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (show) {
      setSearch('');
      setVisibleCount(10);
    }
  }, [show]);

  const normalizedQuery = search.trim().toLowerCase();

  const filteredAccounts = useMemo(() => {
    if (!normalizedQuery) {
      return accounts;
    }

    return accounts.filter((account) => {
      const candidates = [account?.userId, account?.email, account?.phone];
      return candidates
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())
        .some((value) => value.includes(normalizedQuery));
    });
  }, [accounts, normalizedQuery]);

  useEffect(() => {
    setVisibleCount(10);
  }, [normalizedQuery]);

  const handleScroll = useCallback(
    (event) => {
      const target = event.currentTarget;
      if (!target) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = target;
      if (scrollHeight - (scrollTop + clientHeight) <= 32) {
        setVisibleCount((current) => {
          if (current >= filteredAccounts.length) {
            return current;
          }
          return Math.min(filteredAccounts.length, current + 10);
        });
      }
    },
    [filteredAccounts.length],
  );

  const visibleAccounts = filteredAccounts.slice(0, visibleCount);

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="align-items-center">
        <Modal.Title>Аккаунты без заявок на верификацию</Modal.Title>
        {onReload && (
          <Button
            variant="outline-primary"
            size="sm"
            className="ms-auto"
            onClick={onReload}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Загрузка…
              </>
            ) : (
              'Обновить'
            )}
          </Button>
        )}
      </Modal.Header>
      <Modal.Body className="d-flex flex-column gap-3">
        <Form onSubmit={(event) => event.preventDefault()}>
          <Form.Control
            type="search"
            placeholder="Поиск по ID, e-mail или телефону"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Form>

        {error && <Alert variant="danger" className="mb-0">{error.message}</Alert>}

        <div
          className="border rounded"
          style={{ maxHeight: '60vh', overflowY: 'auto' }}
          onScroll={handleScroll}
        >
          {loading && !accounts.length ? (
            <div className="py-5 text-center text-muted">
              <Spinner animation="border" className="mb-2" />
              <div>Загрузка аккаунтов…</div>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="py-5 text-center text-muted">Подходящих аккаунтов нет.</div>
          ) : (
            <ListGroup variant="flush">
              {visibleAccounts.map((account) => (
                <ListGroup.Item key={account.userId} className="py-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                    <div className="fw-semibold">ID {account.userId}</div>
                    <div className="text-muted small">
                      Баланс: {formatBalance(account.totalBalance)} {account.currency}
                    </div>
                    <div className="text-muted small">
                      Регистрация: {formatDateTime(account.createdAt)}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          {loading && accounts.length > 0 && (
            <div className="py-3 text-center text-muted">
              <Spinner animation="border" size="sm" className="me-2" />
              Обновление списка…
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
