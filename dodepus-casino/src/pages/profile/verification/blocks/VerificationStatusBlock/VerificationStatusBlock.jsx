import { useMemo, useState } from 'react';
import { Row, Col, Card, Button, Toast, ToastContainer, Alert } from 'react-bootstrap';
import { Circle, CheckCircle, CircleHelp, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../app/AuthContext.jsx';

const FIELD_KEYS = Object.freeze(['email', 'phone', 'address', 'doc']);

const ICON_LABELS = Object.freeze({
  idle: 'требуется подтверждение',
  pending: 'ожидает проверки',
  rejected: 'отклонено',
  approved: 'подтверждено',
});

const ICON_BG_CLASS = Object.freeze({
  idle: 'bg-primary-subtle border-primary-subtle',
  pending: 'bg-warning-subtle border-warning-subtle',
  rejected: 'bg-danger-subtle border-danger-subtle',
  approved: 'bg-success-subtle border-success-subtle',
});

const ICON_COMPONENT = Object.freeze({
  idle: (size) => <Circle size={size} className="text-primary" />,
  pending: (size) => <CircleHelp size={size} className="text-warning" />,
  rejected: (size) => <CircleAlert size={size} className="text-danger" />,
  approved: (size) => <CheckCircle size={size} className="text-success" />,
});

const ICON_SIZE = 56;

const getLatestRequest = (requests) => {
  if (!Array.isArray(requests)) return null;

  return requests.reduce((latest, current) => {
    if (!current || typeof current !== 'object') return latest;
    if (!latest) return current;

    const toTimestamp = (value) => {
      if (!value) return 0;
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const latestTs = toTimestamp(latest.updatedAt || latest.submittedAt);
    const currentTs = toTimestamp(current.updatedAt || current.submittedAt);
    return currentTs > latestTs ? current : latest;
  }, null);
};

export default function VerificationStatusBlock() {
  const navigate = useNavigate();
  const { user, submitVerificationRequest } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingKey, setSubmittingKey] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const uploads = Array.isArray(user?.verificationUploads)
    ? user.verificationUploads
    : [];

  const normalizeUploadCategory = (upload) => {
    const raw =
      upload?.verificationCategory ||
      upload?.verificationKind ||
      upload?.category ||
      upload?.kind;
    const value = typeof raw === 'string' ? raw.toLowerCase() : '';
    if (value === 'address') return 'address';
    return 'identity';
  };

  const hasAddressUpload = uploads.some((upload) => normalizeUploadCategory(upload) === 'address');
  const hasIdentityUpload = uploads.some((upload) => normalizeUploadCategory(upload) === 'identity');

  const emailDone = Boolean(user?.emailVerified);
  const phoneDone = !!(user?.phone && String(user.phone).replace(/\D/g, '').length >= 10);
  const addressInfoProvided = !!(user?.address && String(user.address).trim().length >= 5);
  const addressDone = addressInfoProvided && hasAddressUpload;
  const docDone = hasIdentityUpload;

  const items = [
    { key: 'email', label: 'Почта', done: emailDone },
    { key: 'phone', label: 'Телефон', done: phoneDone },
    { key: 'address', label: 'Адрес', done: addressDone },
    { key: 'doc', label: 'Документ', done: docDone },
  ];

  const hasAnyCompleted = items.some((item) => item.done);

  const latestRequest = useMemo(
    () => getLatestRequest(user?.verificationRequests),
    [user?.verificationRequests],
  );

  const requestStatus = useMemo(() => {
    if (!latestRequest || typeof latestRequest.status !== 'string') return '';
    return latestRequest.status.toLowerCase();
  }, [latestRequest]);

  const fieldSnapshots = useMemo(() => {
    if (!Array.isArray(user?.verificationRequests)) {
      return {};
    }

    const toTimestamp = (value) => {
      if (!value) return 0;
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return user.verificationRequests.reduce((acc, request) => {
      if (!request || typeof request !== 'object') {
        return acc;
      }

      const timestamp = toTimestamp(
        request.updatedAt || request.reviewedAt || request.submittedAt,
      );
      const status = typeof request.status === 'string'
        ? request.status.toLowerCase()
        : '';

      FIELD_KEYS.forEach((key) => {
        const completed = Boolean(request?.completedFields?.[key]);
        const requested = Boolean(
          request?.requestedFields?.[key] ?? request?.completedFields?.[key],
        );

        if (!completed && !requested) {
          return;
        }

        const current = acc[key];
        if (!current || timestamp >= current.timestamp) {
          acc[key] = {
            completed,
            requested,
            status,
            timestamp,
          };
        }
      });

      return acc;
    }, {});
  }, [user?.verificationRequests]);

  const isRequestPending = requestStatus === 'pending' || requestStatus === 'partial';
  const isRequestRejected = requestStatus === 'rejected';
  const isRequestApproved = requestStatus === 'approved';

  const handleSubmit = async (originKey = null) => {
    setSubmitError(null);
    setShowSuccessToast(false);

    if (!submitVerificationRequest) {
      setSubmitError('Отправка доступна только авторизованным пользователям.');
      return;
    }

    if (!hasAnyCompleted) {
      setSubmitError('Заполните данные профиля перед отправкой заявки.');
      return;
    }

    setIsSubmitting(true);
    setSubmittingKey(originKey);

    try {
      const availableFields = {
        email: emailDone,
        phone: phoneDone,
        address: addressDone,
        doc: docDone,
      };

      const requestedFieldKeys = (() => {
        if (
          originKey &&
          Object.prototype.hasOwnProperty.call(availableFields, originKey)
        ) {
          return availableFields[originKey] ? { [originKey]: true } : {};
        }

        return Object.fromEntries(
          Object.entries(availableFields).filter(([, value]) => Boolean(value)),
        );
      })();

      if (!Object.keys(requestedFieldKeys).length) {
        setSubmitError('Выберите пункт, который нужно отправить на проверку.');
        return;
      }

      await Promise.resolve(
        submitVerificationRequest({
          fields: requestedFieldKeys,
          originKey,
        }),
      );
      setShowSuccessToast(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось отправить запрос. Попробуйте ещё раз.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
      setSubmittingKey(null);
    }
  };

  const getStateForItem = (itemKey) => {
    const snapshot = fieldSnapshots[itemKey];
    const snapshotStatus = snapshot?.status || requestStatus;
    const snapshotCompleted = Boolean(snapshot?.completed);
    const snapshotRequested = Boolean(snapshot?.requested);

    const fallbackCompleted = itemKey === 'email' ? Boolean(user?.emailVerified) : false;
    const isCompleted = snapshot ? snapshotCompleted : fallbackCompleted;

    if (isCompleted) {
      return 'approved';
    }

    if (snapshotRequested) {
      if (snapshotStatus === 'rejected') {
        return 'rejected';
      }
      if (snapshotStatus === 'pending' || snapshotStatus === 'partial') {
        return 'pending';
      }
    }

    return 'idle';
  };

  const statusMessage = (() => {
    if (isRequestPending) {
      return 'Заявка отправлена и ожидает проверки администратора.';
    }
    if (isRequestRejected) {
      return 'Последняя заявка отклонена. Проверьте данные и отправьте её повторно.';
    }
    if (isRequestApproved) {
      return 'Ваша заявка одобрена. Дополнительных действий не требуется.';
    }
    return hasAnyCompleted
      ? 'После заполнения данных отправьте заявку на проверку под нужным пунктом.'
      : 'Заполните хотя бы один пункт, чтобы отправить заявку на проверку.';
  })();

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title className="mb-3">Статусы верификации</Card.Title>
          <Row className="text-center g-4">
            {items.map((item) => {
              const state = getStateForItem(item.key);
              const iconLabel = `${item.label}: ${ICON_LABELS[state]}`;
              const iconComponent = ICON_COMPONENT[state](ICON_SIZE);
              const iconWrapper = (
                <span
                  className={`d-inline-flex align-items-center justify-content-center rounded-circle border border-2 shadow-sm ${ICON_BG_CLASS[state]}`}
                  style={{ width: 92, height: 92 }}
                >
                  {iconComponent}
                </span>
              );

              const canNavigateToPersonal = !item.done && (state === 'idle' || state === 'rejected');
              const canSubmit = item.done && (state === 'idle' || state === 'rejected');
              const buttonVariant = state === 'rejected' ? 'warning' : 'primary';
              const buttonLabel =
                isSubmitting && submittingKey === item.key ? 'Отправка…' : 'Подтвердить';
              const showFillHint = !item.done && (state === 'idle' || state === 'rejected');

              return (
                <Col key={item.key} xs={6} md={3} className="d-flex flex-column align-items-center">
                  <div className="fw-medium mb-2">{item.label}</div>

                  {canNavigateToPersonal ? (
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none"
                      onClick={() => navigate('/profile/personal')}
                      aria-label={`Открыть Персональные данные: ${item.label}`}
                    >
                      <span role="img" aria-label={iconLabel}>
                        {iconWrapper}
                      </span>
                    </Button>
                  ) : (
                    <div role="img" aria-label={iconLabel}>
                      {iconWrapper}
                    </div>
                  )}

                  {state === 'pending' ? (
                    <div className="mt-2 small fw-semibold text-warning">Ожидание</div>
                  ) : null}

                  {canSubmit ? (
                    <Button
                      type="button"
                      size="sm"
                      variant={buttonVariant}
                      className="mt-2 px-3"
                      disabled={isSubmitting}
                      onClick={() => {
                        handleSubmit(item.key);
                      }}
                    >
                      {buttonLabel}
                    </Button>
                  ) : null}

                  {state === 'approved'
                    ? null
                    : state === 'pending'
                      ? null
                      : showFillHint
                        ? (
                            <div className="mt-2 small text-muted">Заполните данные профиля</div>
                          )
                        : null}
                </Col>
              );
            })}
          </Row>

          <div className="text-secondary small mt-4">{statusMessage}</div>

          {submitError && (
            <Alert variant="danger" className="mt-3 mb-0">
              {submitError}
            </Alert>
          )}
        </Card.Body>
      </Card>
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          bg="success"
          onClose={() => setShowSuccessToast(false)}
          show={showSuccessToast}
          delay={4000}
          autohide
        >
          <Toast.Body className="text-white">
            Запрос отправлен в админ-панель на проверку.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
