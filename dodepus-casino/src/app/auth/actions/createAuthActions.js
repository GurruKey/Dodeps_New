import {
  clearStoredSession,
  signInEmailPassword,
  signUpEmailPassword,
  signUpPhonePassword,
} from '../../../../local-sim/auth/api';

export function createAuthActions({ setSession, setUser }) {
  const composeResult = (result) => {
    setSession(result.session);
    setUser(result.user);
    return result;
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
