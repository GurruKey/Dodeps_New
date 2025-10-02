import { useMemo, useRef, useState } from 'react';
import { Button, Alert, Dropdown } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../app/AuthContext.jsx';
import { COUNTRY_CODES, DEFAULT_COUNTRY, formatPhonePlaceholder } from './country-codes';

// утилиты
const onlyDigits = (s) => (s || '').replace(/\D/g, '');
const toE164 = (dial, local) => {
  const d = onlyDigits(dial);
  const l = onlyDigits(local).replace(/^0+/, '');
  return `+${d}${l}`;
};

export default function PhoneLoginForm({ onSuccess, onError }) {
  const { signIn } = useAuth();

  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phoneLocal, setPhoneLocal] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const phoneInputRef = useRef(null);

  const setError = (msg) => {
    const text = msg || '';
    setLocalError(text);
    onError?.(text);
  };

  const phoneOk = useMemo(() => onlyDigits(phoneLocal).length >= 7, [phoneLocal]);
  const canSubmit = phoneOk && password.trim().length >= 6;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) {
      setError('Заполните корректно все поля.');
      return;
    }

    const phone = toE164(country.dial, phoneLocal);

    setSubmitting(true);
    try {
      const safePassword = password.trim();
      await signIn({ phone, password: safePassword });
      onSuccess?.({ identifier: phone, password: safePassword });
    } catch (err) {
      setError(err?.message || 'Ошибка входа');
    } finally {
      setSubmitting(false);
    }
  };

  const CountryToggle = (
    <Dropdown.Toggle
      id="loginCountryDropdown"
      variant="outline-secondary"
      className="d-flex align-items-center gap-2 px-2"
      style={{
        minWidth: 132,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontVariantNumeric: 'tabular-nums',
      }}
      aria-label="Код страны"
    >
      <span className="text-uppercase">{country.code}</span>
      <span className="ms-auto">{country.dial}</span>
    </Dropdown.Toggle>
  );

  return (
    <form onSubmit={onSubmit} noValidate autoComplete="on">
      {localError && <Alert variant="danger" className="mb-3">{localError}</Alert>}

      {/* Телефон */}
      <div className="p-3 mb-3 rounded-3 border border-secondary-subtle">
        <label className="form-label fw-semibold">Номер телефона</label>
        <div className="input-group">
          <Dropdown onSelect={() => {}}>
            {CountryToggle}
            <Dropdown.Menu
              className="dropdown-menu-dark"
              style={{
                maxHeight: 260,
                overflowY: 'auto',
                minWidth: 132,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {COUNTRY_CODES.map((c) => (
                <Dropdown.Item
                  key={c.code}
                  active={c.code === country.code}
                  onClick={() => {
                    setCountry(c);
                    setTimeout(() => phoneInputRef.current?.focus(), 0);
                  }}
                  className="d-flex align-items-center"
                  style={{ gap: 10 }}
                >
                  <span className="text-uppercase" style={{ width: 36 }}>{c.code}</span>
                  <span className="ms-auto">{c.dial}</span>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <input
            ref={phoneInputRef}
            className={`form-control ${phoneLocal && !phoneOk ? 'is-invalid' : ''}`}
            type="tel"
            placeholder={formatPhonePlaceholder(country.dial)}
            value={phoneLocal}
            onChange={(e) => setPhoneLocal(onlyDigits(e.target.value))}
            name="phone"
            autoComplete="username"
            required
          />
        </div>
        {!phoneOk && phoneLocal && (
          <div className="invalid-feedback d-block">Минимум 7 цифр без кода страны.</div>
        )}
      </div>

      {/* Пароль */}
      <div className="p-3 mb-3 rounded-3 border border-secondary-subtle">
        <label htmlFor="loginPasswordPhone" className="form-label fw-semibold">Пароль</label>
        <div className="input-group">
          <input
            id="loginPasswordPhone"
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
        <div className="form-text">Минимум 6 символов.</div>
      </div>

      <Button type="submit" variant="warning" className="w-100" disabled={submitting || !canSubmit}>
        {submitting ? 'Входим…' : 'Войти'}
      </Button>
    </form>
  );
}
