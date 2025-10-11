import { PhoneVerificationForm } from './PhoneVerificationForm.jsx';
import { MODULE_LOCK_HINT } from '../utils.js';

export const phoneModule = {
  key: 'phone',
  label: 'Телефон',
  checkIsReady: ({ readiness }) => Boolean(readiness?.phone),
  getHint: ({ status, requirements }) => {
    if (status === 'pending' || status === 'approved') {
      return MODULE_LOCK_HINT;
    }

    if (!requirements?.hasPhoneValue) {
      return 'Добавьте телефон в разделе «Персональные данные».';
    }

    return null;
  },
  getModalConfig: () => ({
    title: 'Телефон',
    description: 'Добавьте рабочий номер телефона для подтверждения личности и уведомлений.',
    content: <PhoneVerificationForm layout="plain" autoFocus />,
  }),
};

export default phoneModule;
