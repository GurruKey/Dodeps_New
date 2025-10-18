import { useEffect, useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers';

// Формы регистрации берём из barrel `features/auth`
import { EmailRegisterForm, PhoneRegisterForm } from '@/features/auth/index.js';

export default function RegisterPage() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (isAuthed) {
      navigate('/lobby', { replace: true });
    }
  }, [isAuthed, navigate]);

  const handleSuccess = () => {
    const next = location.state?.from?.pathname || '/lobby';
    navigate(next, { replace: true });
  };

  return (
    <div className="container py-4 d-flex justify-content-center">
      <Card className="w-100" style={{ maxWidth: 560 }}>
        <Card.Body>
          <h3 className="text-center mb-3">Регистрация</h3>

          {/* переключатель режимов */}
          <div className="btn-group w-100 mb-3" role="tablist" aria-label="Тип регистрации">
            <Button
              type="button"
              variant={mode === 'email' ? 'warning' : 'outline-warning'}
              onClick={() => setMode('email')}
              aria-pressed={mode === 'email'}
            >
              E-mail
            </Button>
            <Button
              type="button"
              variant={mode === 'phone' ? 'warning' : 'outline-warning'}
              onClick={() => setMode('phone')}
              aria-pressed={mode === 'phone'}
            >
              Телефон
            </Button>
          </div>

          {globalError && <Alert variant="danger">{globalError}</Alert>}

          {/* формы как отдельные блоки */}
          {mode === 'email' ? (
            <EmailRegisterForm onSuccess={handleSuccess} onError={setGlobalError} />
          ) : (
            <PhoneRegisterForm onSuccess={handleSuccess} onError={setGlobalError} />
          )}

          <div className="mt-3">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
