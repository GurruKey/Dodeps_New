import { useState } from 'react';
import { Row, Col, Card, Button, Toast, ToastContainer, Alert } from 'react-bootstrap';
import { Circle, CheckCircle, CircleHelp, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../app/AuthContext.jsx';
import {
  VERIFICATION_MODULES,
  useVerificationModules,
} from '../../../../../shared/verification/index.js';

const ICON_LABELS = Object.freeze({
  waiting: 'требуется подтверждение',
  in_review: 'на проверке',
  rejected: 'отклонено',
  approved: 'подтверждено',
});

const ICON_BG_CLASS = Object.freeze({
  waiting: 'bg-primary-subtle border-primary-subtle',
  in_review: 'bg-warning-subtle border-warning-subtle',
  rejected: 'bg-danger-subtle border-danger-subtle',
  approved: 'bg-success-subtle border-success-subtle',
});

const ICON_COMPONENT = Object.freeze({
  waiting: (size) => <Circle size={size} className="text-primary" />,
  in_review: (size) => <CircleHelp size={size} className="text-warning" />,
  rejected: (size) => <CircleAlert size={size} className="text-danger" />,
  approved: (size) => <CheckCircle size={size} className="text-success" />,
});

const ICON_SIZE = 56;

export default function VerificationStatusBlock() {
  const navigate = useNavigate();
  const { user, submitVerificationRequest } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingKey, setSubmittingKey] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const { modules: moduleStates = {}, summary = {} } = useVerificationModules(user);

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

  const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');
  const hasEmailValue = normalizeString(user?.email).length >= 3;
  const phoneDigits = user?.phone ? String(user.phone).replace(/\D/g, '') : '';
  const hasPhoneValue = phoneDigits.length >= 10;
  const hasAddressStrings = ['country', 'city', 'address'].every((key) =>
    normalizeString(user?.[key]).length >= 2,
  );
  const addressReady = hasAddressStrings || hasAddressUpload;
  const genderValue = String(user?.gender || '').toLowerCase();
  const hasDocStrings =
    normalizeString(user?.firstName).length >= 2 &&
    normalizeString(user?.lastName).length >= 2 &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(user?.dob || '')) &&
    (genderValue === 'male' || genderValue === 'female');
  const docReady = hasDocStrings || hasIdentityUpload;

  const emailReady = hasEmailValue;
  const phoneReady = hasPhoneValue;

  const readinessMap = {
    email: emailReady,
    phone: phoneReady,
    address: addressReady,
    doc: docReady,
  };

  const items = VERIFICATION_MODULES.map((module) => ({
    key: module.key,
    label: module.label,
    isReady: readinessMap[module.key],
    state: moduleStates?.[module.key]?.status || 'waiting',
  }));

  const hasAnyReady = items.some((item) => item.isReady);
  const isRequestPending = Boolean(summary?.hasInReview);
  const isRequestRejected = Boolean(summary?.hasRejected);
  const isRequestApproved = Boolean(summary?.allApproved);

  const handleSubmit = async (originKey = null) => {
    setSubmitError(null);
    setShowSuccessToast(false);

    if (!submitVerificationRequest) {
      setSubmitError('Отправка доступна только авторизованным пользователям.');
      return;
    }

    if (!hasAnyReady) {
      setSubmitError('Заполните данные профиля перед отправкой на проверку.');
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

          const state = moduleStates?.[key]?.status || 'waiting';
          return state === 'waiting' || state === 'rejected';
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
        setSubmitError('Выберите пункт, который доступен для отправки на проверку.');
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

              const canNavigateToPersonal =
                !item.isReady && (state === 'waiting' || state === 'rejected');
              const canSubmit = item.isReady && (state === 'waiting' || state === 'rejected');
              const buttonVariant = state === 'rejected' ? 'warning' : 'primary';
              const buttonLabel =
                isSubmitting && submittingKey === item.key ? 'Отправка…' : 'Подтвердить';
              const showFillHint =
                !item.isReady && (state === 'waiting' || state === 'rejected');
              const hintMessage = (() => {
                switch (item.key) {
                  case 'email':
                    return hasEmailValue
                      ? null
                      : 'Добавьте почту в разделе «Персональные данные».';
                  case 'phone':
                    return hasPhoneValue
                      ? null
                      : 'Укажите номер телефона в разделе «Персональные данные».';
                  case 'address':
                    if (!hasAddressStrings && !hasAddressUpload) {
                      return 'Заполните адрес проживания или загрузите подтверждающий документ.';
                    }
                    if (!hasAddressStrings) {
                      return 'Заполните страну, город и адрес проживания.';
                    }
                    if (!hasAddressUpload) {
                      return 'Загрузите документ для подтверждения адреса.';
                    }
                    return null;
                  case 'doc':
                    if (!hasDocStrings && !hasIdentityUpload) {
                      return 'Заполните данные профиля или загрузите документ, подтверждающий личность.';
                    }
                    if (!hasDocStrings) {
                      return 'Заполните ФИО, дату рождения и выберите пол.';
                    }
                    if (!hasIdentityUpload) {
                      return 'Загрузите документ, подтверждающий личность.';
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

                {state === 'in_review' ? (
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
                    : state === 'in_review'
                      ? null
                      : showFillHint
                        ? (
                            <div className="mt-2 small text-muted">
                              {hintMessage || 'Заполните данные профиля'}
                            </div>
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
