import { Card, Table } from 'react-bootstrap';
import { useVerificationState } from '../state/useVerificationState.js';

const DOCUMENT_TYPE_LABELS = Object.freeze({
  internet_statement: 'Интернет-выписка',
  bank_statement: 'Банковская выписка',
  id_card: 'ID-карта',
  foreign_passport: 'Заграничный паспорт',
  internal_passport: 'Внутренний паспорт',
  residence_permit: 'Вид на жительство',
});

const getDocumentLabel = (upload) => {
  if (!upload || typeof upload !== 'object') return 'Документ';
  const label =
    upload.documentLabel ||
    upload.verificationLabel ||
    DOCUMENT_TYPE_LABELS[String(upload.documentType || upload.verificationType).toLowerCase()];
  return label || 'Документ';
};

export function VerificationHistory() {
  const { user } = useVerificationState();
  const uploads = Array.isArray(user?.verificationUploads) ? user.verificationUploads : [];

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Отправленные файлы</Card.Title>

        {uploads.length === 0 ? (
          <div className="text-secondary">Пока нет отправленных файлов.</div>
        ) : (
          <Table responsive hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Файл</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => {
                const fileName = upload?.name || getDocumentLabel(upload);
                return (
                  <tr key={upload.id}>
                    <td>{fileName}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}

export default VerificationHistory;
