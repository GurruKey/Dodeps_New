// src/features/auth/api.js
import { supabase } from '../../app/supabaseClient';

// Нормализация e-mail: убираем zero-width и пробелы, приводим к нижнему регистру.
const normalizePhone = (phone) => {
  const raw = String(phone ?? '').trim();
  if (!raw) return '';

  const digits = raw.startsWith('+') ? raw.slice(1).replace(/\D/g, '') : raw.replace(/\D/g, '');
  if (!digits) return '';

  return `+${digits}`;
};

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_RE = /^\+[1-9]\d{5,14}$/;

function humanizeAuthError(err) {
  const msg = String(err?.message || err || '');
  const code = String(err?.code || err?.name || '');

  if (/Invalid login credentials/i.test(msg)) return 'Неверный логин или пароль.';
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
 * Регистрация по e-mail + password (ручная).
 */
export async function signUpEmailPassword({ email, password }) {
  const emailNorm = String(email || '').toLowerCase().trim();
  const passNorm = String(password || '').trim();

  if (!EMAIL_RE.test(emailNorm)) throw new Error('Некорректный адрес e-mail.');
  if (
    passNorm.length < 8 ||
    !/\d/.test(passNorm) ||
    !/[a-z]/.test(passNorm) ||
    !/[A-Z]/.test(passNorm)
  ) {
    throw new Error('Пароль не соответствует требованиям: минимум 8 символов, включая цифры и буквы разного регистра.');
  }

  const { data, error } = await supabase.rpc('register_user', {
    email_input: emailNorm,
    phone_input: null,
    password_input: passNorm,
  });

  if (error) {
    throw new Error(humanizeAuthError(error));
  }

  // Устанавливаем сессию вручную, используя полученный JWT
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.token,
    refresh_token: '' // Наша ручная система не использует refresh токены
  });

  if (sessionError) {
    throw new Error('Не удалось установить сессию: ' + sessionError.message);
  }

  return { user: data.user, session: { access_token: data.token }, needsEmailConfirm: false };
}

/**
 * Вход по e-mail + password (ручной).
 */
export async function signInEmailPassword({ email, password }) {
  const emailNorm = String(email || '').toLowerCase().trim();
  const passNorm = String(password || '').trim();

  if (!EMAIL_RE.test(emailNorm) || !passNorm) throw new Error('Введите e-mail и пароль.');

  const { data, error } = await supabase.rpc('authenticate_user', {
    email_input: emailNorm,
    phone_input: null,
    password_input: passNorm,
  });

  if (error) {
    throw new Error(humanizeAuthError(error));
  }

  // Устанавливаем сессию вручную, используя полученный JWT
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.token,
    refresh_token: '' // Наша ручная система не использует refresh токены
  });

  if (sessionError) {
    throw new Error('Не удалось установить сессию: ' + sessionError.message);
  }

  return { user: data.user, session: { access_token: data.token } };
}


/**
 * Регистрация по телефону + password.
 */
export async function signUpPhonePassword({ phone, password } = {}) {
  const phoneNorm = normalizePhone(phone);
  const passNorm = String(password || '').trim();

  if (!PHONE_RE.test(phoneNorm)) throw new Error('Некорректный номер телефона.');
  // Унифицируем требования к паролю
  if (
    passNorm.length < 8 ||
    !/\d/.test(passNorm) ||
    !/[a-z]/.test(passNorm) ||
    !/[A-Z]/.test(passNorm)
  ) {
    throw new Error('Пароль не соответствует требованиям: минимум 8 символов, включая цифры и буквы разного регистра.');
  }

  // Вызываем нашу кастомную SQL функцию `signup`
  const { data, error } = await supabase.rpc('register_user', {
    email_input: null, // В этой форме используется только телефон
    phone_input: phoneNorm,
    password_input: passNorm,
  });

  if (error) {
    throw new Error(humanizeAuthError(error));
  }

  // Устанавливаем сессию вручную, используя полученный JWT
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.token,
    refresh_token: '' // Наша ручная система не использует refresh токены
  });

  if (sessionError) {
    throw new Error('Не удалось установить сессию: ' + sessionError.message);
  }

  // Возвращаем данные, полученные от RPC функции. SMS верификация не используется в ручном режиме.
  return { user: data.user, session: { access_token: data.token }, needsSmsVerify: false };
}