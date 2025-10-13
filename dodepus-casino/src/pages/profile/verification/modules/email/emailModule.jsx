import { EmailVerificationForm } from './EmailVerificationForm.jsx';
import { MODULE_LOCK_HINT } from '../utils.js';

export const emailModule = {
  key: 'email',
  label: 'Почта',
  checkIsReady: ({ readiness }) => Boolean(readiness?.email),
  getHint: ({ status, requirements }) => {
    if (status === 'pending' || status === 'approved') {
      return MODULE_LOCK_HINT;
    }

    if (!requirements?.hasEmailValue) {
      return 'Добавьте почту в разделе «Персональные данные».';
    }

    return null;
  },
  getModalConfig: ({ closeModal }) => ({
    title: 'Почта',
    description: 'Укажите актуальный e-mail, чтобы получать уведомления и подтверждать вход.',
    content: (
      <EmailVerificationForm
        layout="plain"
        autoFocus
        onSubmitSuccess={() => {
          if (typeof closeModal === 'function') {
            closeModal();
          }
        }}
      />
    ),
  }),
};

export default emailModule;
