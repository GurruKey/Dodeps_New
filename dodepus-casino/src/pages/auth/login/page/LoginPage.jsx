import { useEffect, useRef, useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers';

// Формы логина приходят из barrel `features/auth`
import { EmailLoginForm, PhoneLoginForm } from '@/features/auth/index.js';

export default function LoginPage() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [globalError, setGlobalError] = useState('');
  const wasAuthedOnMount = useRef(isAuthed);

  useEffect(() => {
    if (wasAuthedOnMount.current && isAuthed) {
      navigate('/lobby', { replace: true });
    }
  }, [isAuthed, navigate]);

  const handleSuccess = (payload = {}) => {
    const next = location.state?.from?.pathname || '/lobby';
    if (payload?.identifier) {
      // Сбрасываем глобальную ошибку при успешном вводе
      setGlobalError('');
    }
    navigate(next, { replace: true });
  };

  return (
    <div className="container py-4 d-flex justify-content-center">
      <Card className="w-100" style={{ maxWidth: 560 }}>
        <Card.Body>
          <h3 className="text-center mb-3">Вход</h3>

          {/* переключатель вкладок */}
          <div className="btn-group w-100 mb-3" role="tablist" aria-label="Тип входа">
            <Button
              type="button"
              variant={mode === 'email' ? 'warning' : 'outline-warning'}
              onClick={() => { setMode('email'); setGlobalError(''); }}
              aria-pressed={mode === 'email'}
            >
              E-mail
            </Button>
            <Button
              type="button"
              variant={mode === 'phone' ? 'warning' : 'outline-warning'}
              onClick={() => { setMode('phone'); setGlobalError(''); }}
              aria-pressed={mode === 'phone'}
            >
              Телефон
            </Button>
          </div>

          {globalError && <Alert variant="danger">{globalError}</Alert>}

          {/* формы как отдельные блоки */}
          {mode === 'email' ? (
            <EmailLoginForm onSuccess={handleSuccess} onError={setGlobalError} />
          ) : (
            <PhoneLoginForm onSuccess={handleSuccess} onError={setGlobalError} />
          )}

          <div className="mt-3">
            Нет аккаунта? <Link to="/register">Регистрация</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
