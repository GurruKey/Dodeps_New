import { PersonalDataVerificationForm } from './PersonalDataVerificationForm.jsx';
import { IdentityDocumentUploadForm } from './IdentityDocumentUploadForm.jsx';
import { MODULE_LOCK_HINT } from '../utils.js';

export const documentsModule = {
  key: 'doc',
  label: 'Документы',
  checkIsReady: ({ readiness }) => Boolean(readiness?.doc),
  getHint: ({ status, requirements }) => {
    if (status === 'pending' || status === 'approved') {
      return MODULE_LOCK_HINT;
    }

    if (!requirements?.hasPersonalData) {
      return 'Заполните ФИО, дату рождения и выберите пол.';
    }

    if (!requirements?.hasIdentityUpload) {
      return 'Загрузите документ, подтверждающий личность.';
    }

    return null;
  },
  getModalConfig: () => ({
    title: 'Документы и персональные данные',
    description: 'Заполните персональные данные и загрузите документы, подтверждающие личность.',
    content: (
      <div className="d-grid gap-4">
        <PersonalDataVerificationForm layout="plain" />
        <IdentityDocumentUploadForm layout="plain" />
      </div>
    ),
  }),
};

export default documentsModule;
