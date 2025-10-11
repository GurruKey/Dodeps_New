import { emailModule } from './email/emailModule.jsx';
import { phoneModule } from './phone/phoneModule.jsx';
import { addressModule } from './address/addressModule.jsx';
import { documentsModule } from './documents/documentsModule.jsx';

export { createModuleContext, MODULE_LOCK_HINT, normalizeString } from './utils.js';
export { EmailVerificationForm } from './email/EmailVerificationForm.jsx';
export { PhoneVerificationForm } from './phone/PhoneVerificationForm.jsx';
export { AddressVerificationForm } from './address/AddressVerificationForm.jsx';
export { AddressDocumentUploadForm } from './address/AddressDocumentUploadForm.jsx';
export { PersonalDataVerificationForm } from './documents/PersonalDataVerificationForm.jsx';
export { IdentityDocumentUploadForm } from './documents/IdentityDocumentUploadForm.jsx';

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
