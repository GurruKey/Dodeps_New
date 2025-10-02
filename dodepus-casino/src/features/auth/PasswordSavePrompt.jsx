import { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Lock, Eye, EyeOff } from 'lucide-react';

const formatOrigin = () => {
  if (typeof window === 'undefined') return 'dodepus.casino';
  try {
    return window.location.host || 'dodepus.casino';
  } catch (err) {
    return 'dodepus.casino';
  }
};

export default function PasswordSavePrompt({
  show,
  credential,
  onSave,
  onNever,
  onDismiss,
  onRememberChange,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);

  useEffect(() => {
    setShowPassword(false);
    setRememberChoice(false);
  }, [credential?.identifier, show]);

  const origin = useMemo(() => formatOrigin(), []);

  const identifier = credential?.identifier || '';
  const password = credential?.password || '';

  return (
    <Modal
      show={show}
      onHide={() => onDismiss?.({ rememberChoice })}
      centered
      backdrop="static"
      keyboard={false}
      contentClassName="shadow-lg border-0"
    >
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white">
        <div className="d-flex align-items-center gap-2">
          <Lock size={20} />
          <Modal.Title className="fs-5">Сохранить пароль?</Modal.Title>
        </div>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-3 text-secondary">
          Браузер может запомнить пароль, чтобы вы входили быстрее на <strong>{origin}</strong>.
        </p>

        <div className="border rounded-3 p-3 mb-3 bg-body-tertiary">
          <div className="mb-2">
            <div className="text-uppercase text-secondary small fw-semibold">Логин</div>
            <div className="fw-medium" style={{ wordBreak: 'break-all' }}>{identifier}</div>
          </div>

          <div>
            <div className="text-uppercase text-secondary small fw-semibold">Пароль</div>
            <div className="d-flex align-items-center gap-2">
              <code className="fs-6">{showPassword ? password || '••••••' : '••••••'}</code>
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPassword ? 'Скрыть' : 'Показать'}
              </Button>
            </div>
          </div>
        </div>

        <Form.Check
          type="checkbox"
          id="savePasswordNeverAgain"
          label="Больше не спрашивать для этого логина"
          className="mb-0"
          checked={rememberChoice}
          onChange={(e) => {
            const next = e.target.checked;
            setRememberChoice(next);
            onRememberChange?.(next);
          }}
        />
      </Modal.Body>

      <Modal.Footer className="bg-body-tertiary">
        <Button variant="secondary" onClick={() => onDismiss?.({ rememberChoice })}>
          Не сейчас
        </Button>
        <Button variant="outline-secondary" onClick={() => onNever?.({ rememberChoice, explicit: true })}>
          Никогда
        </Button>
        <Button variant="warning" onClick={() => onSave?.({ rememberChoice })}>
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
