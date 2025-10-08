import { useMemo } from 'react';
import { useAuth } from '../../../../app/AuthContext.jsx';
import {
  useVerificationModules,
  computeModuleLocks,
} from '../../../../shared/verification/index.js';

export function useVerificationState() {
  const { user } = useAuth();
  const data = useVerificationModules(user);

  return useMemo(() => {
    const modules = data?.modules ?? {};
    const summary = data?.summary ?? {};
    const locks = computeModuleLocks(modules);
    return { user, modules, summary, locks };
  }, [user, data?.modules, data?.summary]);
}
