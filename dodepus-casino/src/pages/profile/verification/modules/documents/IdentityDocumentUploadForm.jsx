import { DocumentUploader } from '../shared';

const IDENTITY_CONFIG = {
  category: 'identity',
  heading: 'Документы личности',
  lockKey: 'doc',
  lockMessage:
    'Запрос по документам обрабатывается. После отмены или решения администратора загрузка станет доступна снова.',
  helperText:
    'Подойдут ID-карта, заграничный или внутренний паспорт, вид на жительство.',
  options: [
    { value: 'id_card', label: 'ID-карта' },
    { value: 'foreign_passport', label: 'Заграничный паспорт' },
    { value: 'internal_passport', label: 'Внутренний паспорт' },
    { value: 'residence_permit', label: 'Вид на жительство' },
  ],
};

export function IdentityDocumentUploadForm(props) {
  return <DocumentUploader config={IDENTITY_CONFIG} {...props} />;
}

export default IdentityDocumentUploadForm;
