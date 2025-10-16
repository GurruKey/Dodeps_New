import { DocumentUploader } from '../shared';

const ADDRESS_CONFIG = {
  category: 'address',
  heading: 'Документы для адреса',
  lockKey: 'address',
  lockMessage:
    'Отправленный адрес проверяется. Дождитесь решения или отмените запрос, чтобы загрузить новый документ.',
  helperText:
    'Подтвердить адрес можно интернет-выпиской или банковской выпиской с заретушированными данными карт.',
  options: [
    { value: 'internet_statement', label: 'Интернет-выписка' },
    { value: 'bank_statement', label: 'Банковская выписка' },
  ],
};

export function AddressDocumentUploadForm(props) {
  return <DocumentUploader config={ADDRESS_CONFIG} {...props} />;
}

export default AddressDocumentUploadForm;
