import { useMemo, useRef, useState } from 'react';
import { Button, Alert, Dropdown } from 'react-bootstrap';
import { Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY,
  formatPhonePlaceholder,
} from '@/features/auth/country-codes.js';
import { useAuth } from '@/app/providers';

// утилиты
const onlyDigits = (s) => (s || '').replace(/\D/g, '');
const toE164 = (dial, local) => {
  const d = onlyDigits(dial);
  const l = onlyDigits(local).replace(/^0+/, '');
  return `+${d}${l}`;
};

export default function PhoneRegisterForm({ onSuccess, onError }) {
  const { signUp } = useAuth();
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phoneLocal, setPhoneLocal] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promo, setPromo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [info, setInfo] = useState('');

  const phoneInputRef = useRef(null);

  const setError = (msg) => {
    const text = msg || '';
    setLocalError(text);
    setInfo('');
    onError?.(text);
  };

  // Правила пароля: латиница + цифры
  const pwdRules = useMemo(() => {
    const p = password || '';
    return {
      len: p.length >= 8,
      digit: /\d/.test(p),
      lower: /[a-z]/.test(p), // латинская строчная
      upper: /[A-Z]/.test(p), // латинская заглавная
    };
  }, [password]);

  const allPwdOk = pwdRules.len && pwdRules.digit && pwdRules.lower && pwdRules.upper;
  const phoneOk = onlyDigits(phoneLocal).length >= 7;

  const phonePlaceholder = formatPhonePlaceholder(country.dial);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phoneOk) return setError('Введите корректный номер телефона.');
    if (!allPwdOk) return setError('Пароль не соответствует требованиям.');
    if (!agree) return setError('Подтвердите согласие.');

    const phoneE164 = toE164(country.dial, phoneLocal);

    setSubmitting(true);
    try {
      const { needsSmsVerify } = await signUp({
        phone: phoneE164,
        password: password.trim(),
        // TODO: promo можно сохранить позже в профиле/БД
      });

      if (needsSmsVerify) {
        setInfo('Мы отправили SMS с кодом подтверждения. Введите код, чтобы завершить регистрацию.');
      }

      onSuccess?.();
    } catch (err) {
      setError(err?.message || 'Ошибка регистрации по телефону');
    } finally {
      setSubmitting(false);
    }
  };

  const CountryToggle = (
    <Dropdown.Toggle
      id="countryDropdown"
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
      {localError && (
        <Alert variant="danger" className="mb-3" aria-live="polite">
          {localError}
        </Alert>
      )}
      {info && (
        <Alert variant="info" className="mb-3" aria-live="polite">
          {info}
        </Alert>
      )}

      {/* Телефон */}
      <div className="p-3 mb-3 rounded-3 border border-secondary-subtle">
        <label className="form-label fw-semibold" htmlFor="regPhoneLocal">Номер телефона</label>

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
                  <span className="text-uppercase" style={{ width: 36 }}>
                    {c.code}
                  </span>
                  <span className="ms-auto">{c.dial}</span>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <input
            id="regPhoneLocal"
            ref={phoneInputRef}
            className={`form-control ${phoneLocal && !phoneOk ? 'is-invalid' : ''}`}
            type="tel"
            placeholder={phonePlaceholder}
            value={phoneLocal}
            onChange={(e) => setPhoneLocal(onlyDigits(e.target.value).slice(0, 14))}
            name="phone"
            autoComplete="username"
            maxLength={14}
            required
            aria-invalid={Boolean(phoneLocal && !phoneOk)}
          />
        </div>

        {!phoneOk && phoneLocal && (
          <div className="invalid-feedback d-block">Минимум 7 цифр без кода страны.</div>
        )}
      </div>

      {/* Пароль */}
      <div className="p-3 mb-2 rounded-3 border border-secondary-subtle">
        <label htmlFor="passPhoneReg" className="form-label fw-semibold">Пароль</label>
        <div className="input-group">
          <input
            id="passPhoneReg"
            className={`form-control ${password && !allPwdOk ? 'is-invalid' : ''}`}
            type={showPass ? 'text' : 'password'}
            placeholder="Минимум 8 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="new-password"
            autoComplete="new-password"
            minLength={8}
            required
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+"
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

      {/* Согласие */}
      <div className="p-3 mb-3 rounded-3 border border-secondary-subtle bg-dark-subtle">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="agreeRegPhone"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            required
          />
          <label className="form-check-label" htmlFor="agreeRegPhone">
            Я подтверждаю, что мне <strong>21 год</strong>, даю согласие на обработку персональных данных и
            принимаю условия{' '}
            <a href="#" className="link-warning text-decoration-underline">правил игры</a>{' '}
            и{' '}
            <a href="#" className="link-warning text-decoration-underline">условий видов бонусов</a>.
          </label>
        </div>
      </div>

      {/* Промокод */}
      <div className="mb-3">
        <button
          type="button"
          className="btn btn-dark w-100 d-flex justify-content-between align-items-center rounded-3 border border-secondary-subtle"
          onClick={() => setPromoOpen((v) => !v)}
        >
          Промокод
          {promoOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
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
        disabled={submitting || !agree || !allPwdOk || !phoneOk}
      >
        {submitting ? 'Регистрируем…' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
}
