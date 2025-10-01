// src/features/auth/api.js
import { supabase } from '../../app/supabaseClient';

// Жёсткая нормализация e-mail (NFKC + срез мусора)
const normalizeEmail = (e) =>
  String(e ?? '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width
    .replace(/\s+/g, '') // любые пробелы
    .replace(/[<>\u00AB\u00BB"'\(\)\[\]\{\};:]/g, '') // кавычки/скобки
    .replace(/[^\x00-\x7F]/g, '') // только ASCII
    .trim()
    .toLowerCase();

const normalizePhone = (phone) => {
  const raw = String(phone ?? '').trim();
  if (!raw) return '';

  const digits = raw.startsWith('+') ? raw.slice(1).replace(/\D/g, '') : raw.replace(/\D/g, '');
  if (!digits) return '';

  return `+${digits}`;
};

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_RE = /^\+[1-9]\d{5,14}$/;

const toAbsoluteUrl = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return undefined;

  try {
    const base = typeof window !== 'undefined' && window?.location ? window.location.origin : undefined;
    return new URL(raw, base).toString();
  } catch {
    return undefined;
  }
};

function humanizeAuthError(err) {
  const msg = String(err?.message || err || '');
  const code = String(err?.code || err?.name || '');

  if (/already registered|already exists/i.test(msg)) return 'Такой пользователь уже зарегистрирован.';
  if (/email_address_invalid|invalid email/i.test(msg) || code === 'email_address_invalid') return 'Некорректный адрес e-mail.';
  if (/phone/i.test(msg) && /invalid/i.test(msg)) return 'Некорректный номер телефона.';
  if (/signup/i.test(msg) && /disabled|not allowed/i.test(msg))
    return 'Регистрация сейчас недоступна. Попробуйте позже или обратитесь в поддержку.';
  if (/password/i.test(msg) && /weak|length|min/i.test(msg))
    return 'Слабый пароль: минимум 8 символов, латинские буквы и цифра.';
  if (/rate limit|too many|over_email_send_rate_limit/i.test(msg) || code === 'over_email_send_rate_limit')
    return 'Слишком много попыток. Попробуйте позже.';
  if (/otp|verification/i.test(msg)) return 'Требуется подтверждение кода (OTP).';
  return msg || 'Ошибка авторизации';
}

/**
 * Регистрация по e-mail + password.
 * Если redirect явно не задан (параметром или в .env), НЕ передаём его —
 * тогда Supabase использует Site URL из настроек проекта.
 */
export async function signUpEmailPassword({ email, password, redirectTo } = {}) {
  const emailNorm = normalizeEmail(email);
  const passNorm = String(password || '').trim();

  if (!EMAIL_RE.test(emailNorm)) throw new Error('Некорректный адрес e-mail.');
  if (passNorm.length < 6) throw new Error('Пароль должен содержать минимум 6 символов.');

  const envRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL;
  const finalRedirect = toAbsoluteUrl(redirectTo) || toAbsoluteUrl(envRedirect);
  const opts = {};
  if (finalRedirect) opts.emailRedirectTo = finalRedirect;

  const payload = {
    email: emailNorm,
    password: passNorm,
  };

  if (finalRedirect) payload.options = opts;

  const { data, error } = await supabase.auth.signUp(payload);

  if (error) throw new Error(humanizeAuthError(error));
  const needsEmailConfirm = !data?.session && !!data?.user && !!emailNorm;
  return { ...data, needsEmailConfirm };
}

/**
 * Регистрация по телефону + password.
 */
export async function signUpPhonePassword({ phone, password } = {}) {
  const phoneNorm = normalizePhone(phone);
  const passNorm = String(password || '').trim();

  if (!PHONE_RE.test(phoneNorm)) throw new Error('Некорректный номер телефона.');
  if (passNorm.length < 6) throw new Error('Пароль должен содержать минимум 6 символов.');

  const { data, error } = await supabase.auth.signUp({
    phone: phoneNorm,
    password: passNorm,
    options: { channel: 'sms' },
  });

  if (error) throw new Error(humanizeAuthError(error));
  const needsSmsVerify = !data?.session && !!data?.user && !!phoneNorm;
  return { ...data, needsSmsVerify };
}
