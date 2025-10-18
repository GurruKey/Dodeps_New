import { useMemo } from 'react';
import { useAuth } from '@/app/providers';

export function useVerificationActions() {
  const ctx = useAuth?.() || {};

  return useMemo(
    () => ({
      submitVerificationRequest: ctx.submitVerificationRequest,
      cancelVerificationRequest: ctx.cancelVerificationRequest,
      addVerificationUpload: ctx.addVerificationUpload,
    }),
    [ctx.submitVerificationRequest, ctx.cancelVerificationRequest, ctx.addVerificationUpload],
  );
}
