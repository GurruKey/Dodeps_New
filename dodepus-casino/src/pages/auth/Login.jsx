import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';

// Блоки логина (пришлю следующими файлами)
import EmailLoginForm from '../../features/auth/EmailLoginForm.jsx';
import PhoneLoginForm from '../../features/auth/PhoneLoginForm.jsx';
import PasswordSavePrompt from '../../features/auth/PasswordSavePrompt.jsx';

export default function Login() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [globalError, setGlobalError] = useState('');
  const [promptData, setPromptData] = useState(null);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [rememberChoice, setRememberChoice] = useState(false);
  const loginInProgressRef = useRef(false);
  const wasAuthedOnMount = useRef(isAuthed);


  const skipPromptFor = useMemo(() => {
    if (typeof window === 'undefined') return () => false;
    return (identifier) => {
      if (!identifier) return false;
      try {
        const raw = window.localStorage.getItem('dodepus.neverAskPassword');
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return false;
        return parsed.includes(identifier.toLowerCase());
      } catch (err) {
        console.error('Не удалось прочитать настройки запроса пароля', err);
        return false;
      }
    };
  }, []);

  useEffect(() => {
    if (wasAuthedOnMount.current && isAuthed && !promptData && !pendingNavigation) {
      navigate('/lobby', { replace: true });
    }
  }, [isAuthed, navigate, pendingNavigation, promptData]);

  const persistNever = (identifier) => {
    if (typeof window === 'undefined' || !identifier) return;
    try {
      const raw = window.localStorage.getItem('dodepus.neverAskPassword');
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const lower = identifier.toLowerCase();
      if (!list.includes(lower)) {
        window.localStorage.setItem('dodepus.neverAskPassword', JSON.stringify([...list, lower]));
      }
    } catch (err) {
      console.error('Не удалось сохранить настройку запроса пароля', err);
    }
  };

  const persistPassword = (identifier, password) => {
    if (typeof window === 'undefined' || !identifier) return;
    try {
      const raw = window.localStorage.getItem('dodepus.savedPasswords');
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const lower = identifier.toLowerCase();
      const filtered = list.filter((item) => item?.identifier?.toLowerCase?.() !== lower);
      filtered.push({
        identifier,
        password,
        savedAt: new Date().toISOString(),
      });
      window.localStorage.setItem('dodepus.savedPasswords', JSON.stringify(filtered));
    } catch (err) {
      console.error('Не удалось сохранить пароль', err);
    }
  };

  const handleSuccess = (payload = {}) => {
    const next = location.state?.from?.pathname || '/lobby';
    const identifier = payload.identifier?.trim?.() || '';
    const password = payload.password || '';

    if (identifier && skipPromptFor(identifier)) {
      loginInProgressRef.current = false;
      navigate(next, { replace: true });
      return;
    }

    loginInProgressRef.current = true;
    setPendingNavigation(next);
    setRememberChoice(false);
    if (identifier) {
      setPromptData({ identifier, password });
    } else {
      loginInProgressRef.current = false;
      setPendingNavigation(null);
      navigate(next, { replace: true });
    }
  };

  const finalizeLogin = () => {
    const next = pendingNavigation || '/lobby';
    setPromptData(null);
    setPendingNavigation(null);
    setRememberChoice(false);
    loginInProgressRef.current = false;
    navigate(next, { replace: true });
  };

  const rememberIfNeeded = () => {
    if (rememberChoice && promptData?.identifier) {
      persistNever(promptData.identifier);
    }
  };

  const handlePromptSave = () => {
    if (promptData?.identifier) {
      persistPassword(promptData.identifier, promptData.password);
    }
    rememberIfNeeded();
    finalizeLogin();
  };

  const handlePromptNever = () => {
    if (promptData?.identifier) {
      persistNever(promptData.identifier);
    }
    rememberIfNeeded();
    finalizeLogin();
  };

  const handlePromptDismiss = () => {
    rememberIfNeeded();
    finalizeLogin();
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

      <PasswordSavePrompt
        show={Boolean(promptData)}
        credential={promptData}
        onSave={handlePromptSave}
        onNever={handlePromptNever}
        onDismiss={handlePromptDismiss}
        onRememberChange={setRememberChoice}
      />
    </div>
  );
}
