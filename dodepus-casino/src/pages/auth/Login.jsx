import { useEffect, useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';

// Блоки логина (пришлю следующими файлами)
import EmailLoginForm from '../../features/auth/EmailLoginForm.jsx';
import PhoneLoginForm from '../../features/auth/PhoneLoginForm.jsx';

async function offerBrowserPasswordSave(identifier, password) {
  if (typeof window === 'undefined') return;
  const id = identifier?.trim?.();
  const secret = password || '';
  if (!id || !secret) return;

  const { navigator, document } = window;
  const credentialsApi = navigator?.credentials;
  if (!credentialsApi) return;

  try {
    if (typeof credentialsApi.create === 'function') {
      const credential = await credentialsApi.create({
        password: {
          id,
          password: secret,
          name: id,
        },
      });
      if (credential) {
        await credentialsApi.store(credential);
        return;
      }
    }

    if (window.PasswordCredential) {
      const form = document.createElement('form');
      form.method = 'post';
      form.style.display = 'none';
      form.autoComplete = 'on';

      const usernameInput = document.createElement('input');
      usernameInput.type = 'text';
      usernameInput.name = 'username';
      usernameInput.value = id;
      usernameInput.autocomplete = 'username';

      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.name = 'password';
      passwordInput.value = secret;
      passwordInput.autocomplete = 'current-password';

      form.append(usernameInput, passwordInput);
      document.body.appendChild(form);

      try {
        const credential = new window.PasswordCredential(form);
        await credentialsApi.store(credential);
      } finally {
        document.body.removeChild(form);
      }
    }
  } catch (err) {
    console.error('Не удалось сохранить пароль через API браузера', err);
  }
}

export default function Login() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (isAuthed) navigate('/lobby', { replace: true });
  }, [isAuthed, navigate]);

  const handleSuccess = async (payload = {}) => {
    const next = location.state?.from?.pathname || '/lobby';
    await offerBrowserPasswordSave(payload.identifier, payload.password);
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
