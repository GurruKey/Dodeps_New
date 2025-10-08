import { useMemo } from 'react';
import {
  deriveModuleStatesFromRequests,
  summarizeModuleStates,
} from './modules.js';

export function useVerificationModules(user) {
  const requests = Array.isArray(user?.verificationRequests)
    ? user.verificationRequests
    : [];
  const emailVerified = Boolean(user?.emailVerified);

  return useMemo(() => {
    const modules = deriveModuleStatesFromRequests(requests, { emailVerified });
    const summary = summarizeModuleStates(modules);
    return { modules, summary };
  }, [requests, emailVerified]);
}
