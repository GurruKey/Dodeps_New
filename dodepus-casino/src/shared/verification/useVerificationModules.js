import { useMemo } from 'react';
import {
  deriveModuleStatesFromRequests,
  summarizeModuleStates,
} from './modules.js';

export function useVerificationModules(user) {
  return useMemo(() => {
    const requests = Array.isArray(user?.verificationRequests)
      ? user.verificationRequests
      : [];
    const emailVerified = Boolean(user?.emailVerified);

    const modules = deriveModuleStatesFromRequests(requests, { emailVerified });
    const summary = summarizeModuleStates(modules);
    return { modules, summary };
  }, [user?.verificationRequests, user?.emailVerified]);
}
