import { useMemo, useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';
import { signUpEmailPassword } from './api';

export default function EmailRegisterForm({ onSuccess, onError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promo, setPromo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [info, setInfo] = useState('');

  const setError = (msg) => {
    const text = msg || '';
    setLocalError(text);
    setInfo('');
    onError?.(text);
  };

  const emailForValidation = useMemo(() => email.toLowerCase().trim(), [email]);

  // Валидация ASCII-адреса с буквенным TLD
  const emailOk = useMemo(() => {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailForValidation);
  }, [emailForValidation]);

  const pwdRules = useMemo(() => {
    const p = password || '';
    return {
      len: p.length >= 8,
      digit: /\d/.test(p),
      lower: /[a-z]/.test(p),
      upper: /[A-Z]/.test(p),
    };
  }, [password]);

  const allPwdOk = pwdRules.len && pwdRules.digit && pwdRules.lower && pwdRules.upper;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailOk) return setError('Введите корректный E-mail.');
    if (!allPwdOk) return setError('Пароль не соответствует требованиям.');
    if (!agree) return setError('Подтвердите согласие.');

    setSubmitting(true);
    try {
      await signUpEmailPassword({
        email: emailForValidation,
        password: password.trim(),
      });

      onSuccess?.();
    } catch (err) {
      setError(err?.message || 'Ошибка регистрации по E-mail');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate autoComplete="on">
      {localError && <Alert variant="danger" className="mb-3" aria-live="polite">{localError}</Alert>}
      {info && <Alert variant="info" className="mb-3" aria-live="polite">{info}</Alert>}

      <div className="p-3 mb-3 rounded-3 border border-secondary-subtle">
        <label htmlFor="emailReg" className="form-label fw-semibold">Электронная почта</label>
        <input
          id="emailReg"
          className={`form-control ${email && !emailOk ? 'is-invalid' : ''}`}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          autoComplete="username"
          required
          aria-invalid={Boolean(email && !emailOk)}
        />
        {!emailOk && email && (
          <div className="invalid-feedback d-block">
            Укажите действительный адрес e-mail (например, name@domain.com).
          </div>
        )}
      </div>

      <div className="p-3 mb-2 rounded-3 border border-secondary-subtle">
        <label htmlFor="passEmailReg" className="form-label fw-semibold">Пароль</label>
        <div className="input-group">
          <input
            id="passEmailReg"
            className={`form-control ${password && !allPwdOk ? 'is-invalid' : ''}`}
            type={showPass ? 'text' : 'password'}
            placeholder="Минимум 8 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="new-password"
            autoComplete="new-password"
            minLength={8}
            required
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]+"
            title="Минимум 8 символов, латинские буквы (минимум 1 строчная и 1 заглавная) и хотя бы одна цифра"
            aria-invalid={Boolean(password && !allPwdOk)}
          />
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-1"
            onClick={() => setShowPass((v) => !v)}
            aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
            title={showPass ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            {showPass ? 'Скрыть' : 'Показать'}
          </button>
        </div>

        <ul className="list-unstyled small mt-3 mb-0">
          <li className={pwdRules.len ? 'text-success' : 'text-danger'}>• минимум 8 символов</li>
          <li className={pwdRules.digit ? 'text-success' : 'text-danger'}>• минимум 1 цифра (0–9)</li>
          <li className={pwdRules.lower ? 'text-success' : 'text-danger'}>• минимум 1 строчная латинская буква (a–z)</li>
          <li className={pwdRules.upper ? 'text-success' : 'text-danger'}>• минимум 1 заглавная латинская буква (A–Z)</li>
        </ul>
      </div>

      <div className="p-3 mb-3 rounded-3 border border-secondary-subtle bg-dark-subtle">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="agreeRegEmail"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            required
          />
          <label className="form-check-label" htmlFor="agreeRegEmail">
            Я подтверждаю, что мне <strong>21 год</strong>, даю согласие на обработку персональных данных и
            принимаю условия <a href="#" className="link-warning text-decoration-underline">правил игры</a> и <a href="#" className="link-warning text-decoration-underline">условий видов бонусов</a>.
          </label>
        </div>
      </div>

      <div className="mb-3">
        <button
          type="button"
          className="btn btn-dark w-100 d-flex justify-content-between align-items-center rounded-3 border border-secondary-subtle"
          onClick={() => setPromoOpen((v) => !v)}
        >
          Промокод
        </button>
        {promoOpen && (
          <div className="mt-2">
            <input
              className="form-control"
              type="text"
              placeholder="Введите промокод"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
            />
          </div>
        )}
      </div>

      <Button
        type="submit"
        variant="warning"
        className="w-100"
        disabled={submitting || !agree || !allPwdOk || !emailOk}
      >
        {submitting ? 'Регистрируем…' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
}
