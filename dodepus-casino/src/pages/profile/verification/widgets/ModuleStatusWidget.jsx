import { useMemo, useState } from 'react';
import { Card, Row, Col, Button, Toast, ToastContainer, Alert, Modal } from 'react-bootstrap';
import { Circle, CheckCircle, CircleHelp, CircleX, RotateCcw } from 'lucide-react';
import { useVerificationState } from '../state/useVerificationState.js';
import { useVerificationActions } from '../actions/useVerificationActions.js';
import {
  PROFILE_VERIFICATION_MODULES,
  PROFILE_VERIFICATION_MODULE_MAP,
  createModuleContext,
} from '../modules/index.js';

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

const MODULE_LABELS = PROFILE_VERIFICATION_MODULES.reduce((acc, module) => {
  acc[module.key] = module.label;
  return acc;
}, {});

export function ModuleStatusWidget() {
  const { user, modules, summary } = useVerificationState();
  const { submitVerificationRequest, cancelVerificationRequest } = useVerificationActions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingKey, setSubmittingKey] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelingKey, setCancelingKey] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModuleKey, setActiveModuleKey] = useState(null);
  const [modalHint, setModalHint] = useState('');

  const uploads = useMemo(
    () => (Array.isArray(user?.verificationUploads) ? user.verificationUploads : []),
    [user?.verificationUploads],
  );

  const moduleContext = useMemo(
    () => createModuleContext(user, uploads),
    [user, uploads],
  );

  const readinessMap = useMemo(() => {
    const readiness = {};
    PROFILE_VERIFICATION_MODULES.forEach((module) => {
      readiness[module.key] = module.checkIsReady
        ? Boolean(module.checkIsReady(moduleContext))
        : false;
    });
    return readiness;
  }, [moduleContext]);

  const items = useMemo(
    () =>
      PROFILE_VERIFICATION_MODULES.map((module) => ({
        key: module.key,
        label: module.label,
        isReady: Boolean(readinessMap[module.key]),
        state: modules?.[module.key]?.status || 'idle',
        definition: module,
      })),
    [modules, readinessMap],
  );

  const handleOpenModule = (moduleKey, hintMessage = '') => {
    setActiveModuleKey(moduleKey);
    setModalHint(hintMessage || '');
    setIsModalOpen(true);
  };

  const handleCloseModule = () => {
    setIsModalOpen(false);
    setActiveModuleKey(null);
    setModalHint('');
  };

  const modalDefinition = activeModuleKey
    ? PROFILE_VERIFICATION_MODULE_MAP[activeModuleKey]
    : null;
  const modalConfig = modalDefinition?.getModalConfig
    ? modalDefinition.getModalConfig({
        context: moduleContext,
        readiness: moduleContext.readiness,
        requirements: moduleContext.requirements,
      })
    : null;
  const modalTitle = modalConfig?.title || (activeModuleKey ? MODULE_LABELS[activeModuleKey] : '');
  const modalDescription = modalConfig?.description || '';
  const modalContent = modalConfig?.content || null;

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
      const availableFields = {};
      PROFILE_VERIFICATION_MODULES.forEach(({ key }) => {
        if (!readinessMap[key]) {
          return;
        }

        const state = modules?.[key]?.status || 'idle';
        if (state === 'idle' || state === 'rejected') {
          availableFields[key] = true;
        }
      });

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

  const buildCancelPayload = (moduleKey) => {
    if (!moduleKey) {
      return {};
    }

    const normalizedKey = String(moduleKey).trim().toLowerCase();
    const aliasMap = {
      email: ['email'],
      phone: ['phone'],
      address: ['address'],
      doc: ['doc', 'document', 'documents'],
    };

    const aliases = aliasMap[normalizedKey] || [normalizedKey];
    const selection = aliases.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    return {
      field: normalizedKey,
      fields: selection,
      modules: selection,
      requestedFields: selection,
    };
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
      const payload = buildCancelPayload(originKey);
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

              const canSubmit = item.isReady && (iconKey === 'idle' || iconKey === 'rejected');
              const canCancel = iconKey === 'pending';
              const isSubmittingCurrent = isSubmitting && submittingKey === item.key;
              const isCancelingCurrent = isCanceling && cancelingKey === item.key;

              const buttonVariant = iconKey === 'rejected' ? 'warning' : 'primary';
              const buttonLabel = isSubmittingCurrent ? 'Отправка…' : 'Подтвердить';

              const cancelVariant = 'outline-secondary';
              const cancelLabel = isCancelingCurrent ? 'Отмена…' : 'Отменить запрос';

              const moduleState = modules?.[item.key] || {};
              const hintMessage = item.definition?.getHint
                ? item.definition.getHint({
                    status: iconKey,
                    moduleState,
                    readiness: moduleContext.readiness,
                    requirements: moduleContext.requirements,
                    context: moduleContext,
                  })
                : null;

              return (
                <Col key={item.key} xs={6} md={3} className="d-flex flex-column align-items-center">
                  <div className="fw-medium mb-2">{item.label}</div>

                  <div>
                    <button
                      type="button"
                      className="p-0 border-0 bg-transparent"
                      onClick={() => handleOpenModule(item.key, hintMessage)}
                      aria-label={`Открыть модуль: ${item.label}`}
                      title={`Заполнить модуль «${item.label}»`}
                      style={{ lineHeight: 0, cursor: 'pointer' }}
                    >
                      <span role="img" aria-label={iconLabel}>
                        {iconWrapper}
                      </span>
                    </button>
                  </div>

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
      <Modal
        show={isModalOpen && Boolean(activeModuleKey)}
        onHide={handleCloseModule}
        size="lg"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-grid gap-3">
          {modalDescription ? <div className="text-secondary">{modalDescription}</div> : null}
          {modalHint ? (
            <Alert variant="secondary" className="mb-0">
              {modalHint}
            </Alert>
          ) : null}
          {modalContent}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ModuleStatusWidget;
