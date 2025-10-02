import {
  clearStoredSession,
  signInEmailPassword,
  signUpEmailPassword,
  signUpPhonePassword,
} from '../../../features/auth/api';
import { composeUser } from '../composeUser';
import { loadExtras } from '../profileExtras';

export function createAuthActions({ setSession, setUser }) {
  const composeResult = (result) => {
    const extras = loadExtras(result.user.id);
    const composedUser = composeUser(result.user, extras);
    setSession(result.session);
    setUser(composedUser);
    return { ...result, user: composedUser };
  };

  const signIn = async ({ email, phone, password }) => {
    if (email) {
      const result = await signInEmailPassword({ email, password });
      return composeResult(result);
    }

    if (phone) {
      throw new Error('Вход по номеру телефона пока не реализован.');
    }

    throw new Error('Укажите E-mail для входа.');
  };

  const signUp = async ({ email, phone, password, redirectTo } = {}) => {
    if (email) {
      const result = await signUpEmailPassword({ email, password, redirectTo });
      return composeResult(result);
    }

    if (phone) {
      const result = await signUpPhonePassword({ phone, password });
      return composeResult(result);
    }

    throw new Error('Укажите E-mail или телефон для регистрации.');
  };

  const signOut = async () => {
    clearStoredSession();
    setSession(null);
    setUser(null);
  };

  return { signIn, signUp, signOut };
}
