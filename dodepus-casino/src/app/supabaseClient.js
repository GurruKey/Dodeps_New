// src/app/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function assertEnv(name, value) {
  if (!value || typeof value !== 'string' || !value.trim()) {
    throw new Error(`[Supabase] Не задана переменная ${name}. Добавь её в .env.local и перезапусти dev-сервер.`);
  }
}
assertEnv('VITE_SUPABASE_URL', SUPABASE_URL);
assertEnv('VITE_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  // ВАЖНО: ставим заголовки явно, чтобы сервер точно видел ключ
  global: {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'x-client-info': 'dodepus-casino-web',
    },
  },
});
