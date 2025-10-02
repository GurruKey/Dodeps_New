import { useEffect, useState } from 'react';
import { initAuthEffect } from '../session/initAuthEffect';

export function useAuthState() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => initAuthEffect({ setSession, setUser, setLoading }), []);

  return {
    session,
    setSession,
    user,
    setUser,
    loading,
    setLoading,
  };
}
