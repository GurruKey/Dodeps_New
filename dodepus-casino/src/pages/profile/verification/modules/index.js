import { emailModule } from './email';
import { phoneModule } from './phone';
import { addressModule } from './address';
import { documentsModule } from './documents';

export { createModuleContext, MODULE_LOCK_HINT, normalizeString } from './utils.js';
export { EmailVerificationForm } from './email';
export { PhoneVerificationForm } from './phone';
export { AddressVerificationForm, AddressDocumentUploadForm } from './address';
export { PersonalDataVerificationForm, IdentityDocumentUploadForm } from './documents';

export const PROFILE_VERIFICATION_MODULES = Object.freeze([
  emailModule,
  phoneModule,
  addressModule,
  documentsModule,
]);

export const PROFILE_VERIFICATION_MODULE_MAP = PROFILE_VERIFICATION_MODULES.reduce((acc, module) => {
  acc[module.key] = module;
  return acc;
}, {});
