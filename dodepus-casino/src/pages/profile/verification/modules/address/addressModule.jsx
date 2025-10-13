import { AddressVerificationForm } from './AddressVerificationForm.jsx';
import { AddressDocumentUploadForm } from './AddressDocumentUploadForm.jsx';
import { MODULE_LOCK_HINT } from '../utils.js';

export const addressModule = {
  key: 'address',
  label: 'Адрес',
  checkIsReady: ({ readiness }) => Boolean(readiness?.address),
  getHint: ({ status, requirements }) => {
    if (status === 'pending' || status === 'approved') {
      return MODULE_LOCK_HINT;
    }

    if (!requirements?.hasAddressFields) {
      return 'Заполните страну, город и адрес проживания.';
    }

    if (!requirements?.hasAddressUpload) {
      return 'Загрузите документ, подтверждающий адрес.';
    }

    return null;
  },
  getModalConfig: () => ({
    title: 'Адрес проживания',
    description: 'Заполните страну, город и адрес проживания и приложите подтверждающий документ.',
    content: (
      <div className="d-grid gap-4">
        <AddressVerificationForm layout="plain" />
        <AddressDocumentUploadForm layout="plain" />
      </div>
    ),
  }),
};

export default addressModule;
