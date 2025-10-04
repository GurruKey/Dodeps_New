import { useState } from 'react';
import { Row, Col, Card, Button, Toast, ToastContainer, Alert } from 'react-bootstrap';
import { Circle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../app/AuthContext.jsx';

export default function VerificationStatusBlock() {
  const navigate = useNavigate();
  const { user, submitVerificationRequest } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Локальные правила готовности (без БД)
  const emailDone = Boolean(user?.emailVerified);
  const phoneDone = !!(user?.phone && String(user.phone).replace(/\D/g, '').length >= 10);
  const addressDone = !!(user?.address && String(user.address).trim().length >= 5);
  const docDone = Array.isArray(user?.verificationUploads) && user.verificationUploads.length > 0;

  const items = [
    { key: 'email',   label: 'Почта',    done: emailDone },
    { key: 'phone',   label: 'Телефон',  done: phoneDone },
    { key: 'address', label: 'Адрес',    done: addressDone },
    { key: 'doc',     label: 'Документ', done: docDone },
  ];

  const hasAnyCompleted = items.some((item) => item.done);

  const handleSubmit = async () => {
    setSubmitError(null);
    setShowSuccessToast(false);

    if (!submitVerificationRequest) {
      setSubmitError('Отправка доступна только авторизованным пользователям.');
      return;
    }

    setIsSubmitting(true);

    try {
      await Promise.resolve(
        submitVerificationRequest({
          email: emailDone,
          phone: phoneDone,
          address: addressDone,
          doc: docDone,
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
    }
  };

  return (
    <>
      <Card>
        <Card.Body>
        <Card.Title className="mb-3">Статусы верификации</Card.Title>
        <Row className="text-center g-4">
          {items.map((s) => (
            <Col key={s.key} xs={6} md={3}>
              <div className="fw-medium mb-2">{s.label}</div>

              {/* Если выполнено — яркая галочка и НЕ кликабельна */}
              {s.done ? (
                <div
                  role="img"
                  aria-label={`${s.label}: выполнено`}
                  className="d-inline-flex align-items-center justify-content-center rounded-circle p-2 bg-success-subtle"
                  style={{ filter: 'drop-shadow(0 0 .6rem rgba(25,135,84,.7))' }}
                >
                  <CheckCircle size={56} className="text-success" />
                </div>
              ) : (
                // Если не выполнено — кликабельно, ведёт в Персональные данные
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => navigate('/profile/personal')}
                  aria-label={`Открыть Персональные данные: ${s.label}`}
                >
                  <Circle size={56} />
                </Button>
              )}
              <div className="mt-2 small text-muted">Подтвердить</div>
            </Col>
          ))}
        </Row>

        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3 mt-4">
          <div className="text-secondary small">
            {hasAnyCompleted
              ? 'После заполнения полей отправьте заявку на проверку.'
              : 'Заполните хотя бы один пункт, чтобы отправить заявку.'}
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!hasAnyCompleted || isSubmitting}
          >
            {isSubmitting ? 'Отправка…' : 'Подтвердить'}
          </Button>
        </div>

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
