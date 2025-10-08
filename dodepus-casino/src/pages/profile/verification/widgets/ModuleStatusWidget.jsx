import { useMemo, useState } from 'react';
import { Card, Row, Col, Button, Toast, ToastContainer, Alert } from 'react-bootstrap';
import { Circle, CheckCircle, CircleHelp, CircleX, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVerificationState } from '../state/useVerificationState.js';
import { useVerificationActions } from '../actions/useVerificationActions.js';
import { VERIFICATION_MODULES } from '../../../../shared/verification/index.js';

const ICON_LABELS = Object.freeze({
  idle: 'требуется подтверждение',
  pending: 'на проверке',
  rejected: 'отклонено',
  approved: 'подтверждено',
});

const ICON_BG_CLASS = Object.freeze({
  idle: 'bg-secondary-subtle border-secondary-subtle',
  pending: 'bg-warning-subtle border-warning-subtle',
  rejected: 'bg-danger-subtle border-danger-subtle',
  approved: 'bg-success-subtle border-success-subtle',
});

const ICON_COMPONENT = Object.freeze({
  idle: (size) => <Circle size={size} className="text-secondary" />,
  pending: (size) => <CircleHelp size={size} className="text-warning" />,
  rejected: (size) => <CircleX size={size} className="text-danger" />,
  approved: (size) => <CheckCircle size={size} className="text-success" />,
});

const ICON_SIZE = 56;

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

export function ModuleStatusWidget() {
  const navigate = useNavigate();
  const { user, modules, summary } = useVerificationState();
  const { submitVerificationRequest, cancelVerificationRequest } = useVerificationActions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingKey, setSubmittingKey] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelingKey, setCancelingKey] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const uploads = useMemo(
    () => (Array.isArray(user?.verificationUploads) ? user.verificationUploads : []),
    [user?.verificationUploads],
  );

  const hasIdentityUpload = useMemo(
    () =>
      uploads.some((upload) => {
        const raw =
          upload?.verificationCategory ||
          upload?.verificationKind ||
          upload?.category ||
          upload?.kind;
        return String(raw).toLowerCase() === 'identity';
      }),
    [uploads],
  );

  const phoneDigits = user?.phone ? String(user.phone).replace(/\D/g, '') : '';
  const genderValue = String(user?.gender || '').toLowerCase();

  const readinessMap = useMemo(() => {
    const hasEmailValue = normalizeString(user?.email).length >= 3;
    const hasPhoneValue = phoneDigits.length >= 10;
    const hasDocStrings =
      normalizeString(user?.firstName).length >= 2 &&
      normalizeString(user?.lastName).length >= 2 &&
      /^\d{4}-\d{2}-\d{2}$/.test(String(user?.dob || '')) &&
      (genderValue === 'male' || genderValue === 'female');
    const hasAddressStrings = ['country', 'city', 'address'].every((key) =>
      normalizeString(user?.[key]).length >= 2,
    );

    return {
      email: hasEmailValue,
      phone: hasPhoneValue,
      address: hasAddressStrings && hasDocStrings,
      doc: hasDocStrings && hasIdentityUpload,
    };
  }, [user, phoneDigits, genderValue, hasIdentityUpload]);

  const items = useMemo(
    () =>
      VERIFICATION_MODULES.map((module) => ({
        key: module.key,
        label: module.label,
        isReady: readinessMap[module.key],
        state: modules?.[module.key]?.status || 'idle',
      })),
    [modules, readinessMap],
  );

  const hasAnyReady = items.some((item) => item.isReady);
  const isRequestPending = Boolean(summary?.hasPending);
  const isRequestRejected = Boolean(summary?.hasRejected);
  const isRequestApproved = Boolean(summary?.allApproved);

  const handleSubmit = async (originKey = null) => {
    setActionError(null);
    setToastMessage('');
    setShowToast(false);

    if (!submitVerificationRequest) {
      setActionError('Отправка доступна только авторизованным пользователям.');
      return;
    }

    if (!hasAnyReady) {
      setActionError('Заполните данные профиля перед отправкой на проверку.');
      return;
    }

    setIsSubmitting(true);
    setSubmittingKey(originKey);

    try {
      const availableFields = Object.fromEntries(
        Object.entries(readinessMap).filter(([key, isReady]) => {
          if (!isReady) {
            return false;
          }

          const state = modules?.[key]?.status || 'idle';
          return state === 'idle' || state === 'rejected';
        }),
      );

      const requestedFieldKeys = (() => {
        if (
          originKey &&
          Object.prototype.hasOwnProperty.call(availableFields, originKey)
        ) {
          return availableFields[originKey] ? { [originKey]: true } : {};
        }

        return { ...availableFields };
      })();

      if (!Object.keys(requestedFieldKeys).length) {
        setActionError('Выберите пункт, который доступен для отправки на проверку.');
        return;
      }

      await Promise.resolve(
        submitVerificationRequest({
          fields: requestedFieldKeys,
          originKey,
        }),
      );
      setToastMessage('Запрос отправлен в админ-панель на проверку.');
      setShowToast(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось отправить запрос. Попробуйте ещё раз.';
      setActionError(message);
    } finally {
      setIsSubmitting(false);
      setSubmittingKey(null);
    }
  };

  const handleCancel = async (originKey = null) => {
    setActionError(null);
    setToastMessage('');
    setShowToast(false);

    if (!cancelVerificationRequest) {
      setActionError('Отмена доступна только авторизованным пользователям.');
      return;
    }

    setIsCanceling(true);
    setCancelingKey(originKey);

    try {
      const payload = originKey ? { field: originKey } : {};
      await Promise.resolve(cancelVerificationRequest(payload));
      setToastMessage('Запрос отменён. Поля снова доступны для редактирования.');
      setShowToast(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось отменить запрос. Попробуйте ещё раз.';
      setActionError(message);
    } finally {
      setIsCanceling(false);
      setCancelingKey(null);
    }
  };

  const statusMessage = (() => {
    if (isRequestPending) {
      return 'Запрос отправлен и находится на проверке у администратора.';
    }
    if (isRequestRejected) {
      return 'Некоторые пункты отклонены. Обновите данные и отправьте их повторно.';
    }
    if (isRequestApproved) {
      return 'Все модули подтверждены. Изменения станут доступны после сброса статусов администратором.';
    }
    return hasAnyReady
      ? 'После заполнения данных отправьте модуль на проверку под нужным пунктом.'
      : 'Заполните хотя бы один пункт, чтобы отправить модуль на проверку.';
  })();

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title className="mb-3">Статусы верификации</Card.Title>
          <Row className="text-center g-4">
            {items.map((item) => {
              const state = item.state;
              const iconKey = ICON_COMPONENT[state] ? state : 'idle';
              const iconLabel = `${item.label}: ${ICON_LABELS[iconKey] || ICON_LABELS.idle}`;
              const iconComponent = ICON_COMPONENT[iconKey](ICON_SIZE);
              const iconWrapper = (
                <span
                  className={`d-inline-flex align-items-center justify-content-center rounded-circle border border-2 shadow-sm ${
                    ICON_BG_CLASS[iconKey] || ICON_BG_CLASS.idle
                  }`}
                  style={{ width: 92, height: 92 }}
                >
                  {iconComponent}
                </span>
              );

              const canNavigateToPersonal =
                !item.isReady && (iconKey === 'idle' || iconKey === 'rejected');
              const canSubmit = item.isReady && (iconKey === 'idle' || iconKey === 'rejected');
              const canCancel = iconKey === 'pending';
              const isSubmittingCurrent = isSubmitting && submittingKey === item.key;
              const isCancelingCurrent = isCanceling && cancelingKey === item.key;

              const buttonVariant = iconKey === 'rejected' ? 'warning' : 'primary';
              const buttonLabel = isSubmittingCurrent ? 'Отправка…' : 'Подтвердить';

              const cancelVariant = 'outline-secondary';
              const cancelLabel = isCancelingCurrent ? 'Отмена…' : 'Отменить запрос';

              const hintMessage = (() => {
                if (iconKey === 'pending' || iconKey === 'approved') {
                  return 'Поля временно заблокированы до завершения проверки.';
                }

                switch (item.key) {
                  case 'email':
                    return readinessMap.email
                      ? null
                      : 'Добавьте почту в разделе «Персональные данные».';
                  case 'phone':
                    return readinessMap.phone
                      ? null
                      : 'Укажите номер телефона в разделе «Персональные данные».';
                  case 'address':
                    if (!readinessMap.address) {
                      if (!['country', 'city', 'address'].every((key) => normalizeString(user?.[key]).length >= 2)) {
                        return 'Заполните страну, город и адрес проживания.';
                      }
                      return 'Заполните ФИО, дату рождения и выберите пол.';
                    }
                    return null;
                  case 'doc':
                    if (!readinessMap.doc) {
                      if (
                        !(
                          normalizeString(user?.firstName).length >= 2 &&
                          normalizeString(user?.lastName).length >= 2 &&
                          /^\d{4}-\d{2}-\d{2}$/.test(String(user?.dob || '')) &&
                          (genderValue === 'male' || genderValue === 'female')
                        )
                      ) {
                        return 'Заполните ФИО, дату рождения и выберите пол.';
                      }
                      if (!hasIdentityUpload) {
                        return 'Загрузите документ, подтверждающий личность.';
                      }
                    }
                    return null;
                  default:
                    return null;
                }
              })();

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

                  {iconKey === 'pending' ? (
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

                  {canCancel ? (
                    <Button
                      type="button"
                      size="sm"
                      variant={cancelVariant}
                      className="mt-2 px-3 d-inline-flex align-items-center gap-2"
                      disabled={isCanceling}
                      onClick={() => handleCancel(item.key)}
                    >
                      <RotateCcw size={16} />
                      {cancelLabel}
                    </Button>
                  ) : null}

                  {hintMessage ? (
                    <div className="mt-2 small text-muted text-center" style={{ maxWidth: 220 }}>
                      {hintMessage}
                    </div>
                  ) : null}
                </Col>
              );
            })}
          </Row>

          <div className="text-secondary small mt-4">{statusMessage}</div>

          {actionError && (
            <Alert variant="danger" className="mt-3 mb-0">
              {actionError}
            </Alert>
          )}
        </Card.Body>
      </Card>
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast && Boolean(toastMessage)}
          delay={4000}
          autohide
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default ModuleStatusWidget;
