/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react';
import {
  createAdminPanelActions,
  createAuthActions,
  createUserProfileActions,
  useAuthState,
} from '@/app/auth';

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const { session, setSession, user, setUser, loading } = useAuthState();

  const authActions = useMemo(
    () => createAuthActions({ setSession, setUser }),
    [setSession, setUser]
  );

  const userActions = useMemo(
    () => createUserProfileActions({ user, setUser }),
    [user, setUser]
  );

  const adminActions = useMemo(
    () => createAdminPanelActions({ user }),
    [user]
  );

  const value = useMemo(
    () => ({
      loading,
      session,
      user,
      isAuthed: Boolean(user),
      signIn: authActions.signIn,
      signUp: authActions.signUp,
      signOut: authActions.signOut,
      login: authActions.signIn,
      logout: authActions.signOut,
      ...userActions,
      ...adminActions,
    }),
    [loading, session, user, authActions, userActions, adminActions]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
