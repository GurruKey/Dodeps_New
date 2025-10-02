import { useMemo, useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../app/AuthContext.jsx';

export default function EmailLoginForm({ onSuccess, onError }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const setError = (msg) => {
    const text = msg || '';
    setLocalError(text);
    onError?.(text);
  };

  const emailOk = useMemo(() => {
    const e = email.trim().toLowerCase();
    if (!e) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
  }, [email]);

  const canSubmit = emailOk && password.trim().length >= 6;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) {
      setError('Заполните корректно все поля.');
      return;
    }

    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const safePassword = password.trim();
      await signIn({ email: normalizedEmail, password: safePassword });
      await onSuccess?.({ identifier: normalizedEmail, password: safePassword });
    } catch (err) {
      setError(err?.message || 'Ошибка входа');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate autoComplete="on">
      {localError && <Alert variant="danger" className="mb-3">{localError}</Alert>}

      {/* E-mail */}
      <div className="p-3 mb-3 rounded-3 border border-secondary-subtle">
        <label htmlFor="loginEmail" className="form-label fw-semibold">Электронная почта</label>
        <input
          id="loginEmail"
          className={`form-control ${email && !emailOk ? 'is-invalid' : ''}`}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          autoComplete="username"
          required
        />
        {!emailOk && email && (
          <div className="invalid-feedback d-block">Укажите действительный адрес e-mail.</div>
        )}
      </div>

      {/* Пароль */}
      <div className="p-3 mb-3 rounded-3 border border-secondary-subtle">
        <label htmlFor="loginPasswordEmail" className="form-label fw-semibold">Пароль</label>
        <div className="input-group">
          <input
            id="loginPasswordEmail"
            className="form-control"
            type={showPass ? 'text' : 'password'}
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-1"
            onClick={() => setShowPass((v) => !v)}
            aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            {showPass ? 'Скрыть' : 'Показать'}
          </button>
        </div>
      </div>

      <Button type="submit" variant="warning" className="w-100" disabled={submitting || !canSubmit}>
        {submitting ? 'Входим…' : 'Войти'}
      </Button>
    </form>
  );
}
