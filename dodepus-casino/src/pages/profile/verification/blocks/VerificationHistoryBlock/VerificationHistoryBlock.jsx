import { Card, Table } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';

const DOCUMENT_TYPE_LABELS = Object.freeze({
  internet_statement: 'Интернет-выписка',
  bank_statement: 'Банковская выписка',
  id_card: 'ID-карта',
  foreign_passport: 'Заграничный паспорт',
  internal_passport: 'Внутренний паспорт',
  residence_permit: 'Вид на жительство',
});

const CATEGORY_LABELS = Object.freeze({
  address: 'Подтверждение адреса',
  identity: 'Подтверждение личности',
});

const getCategoryLabel = (upload) => {
  const raw =
    upload?.verificationCategory ||
    upload?.verificationKind ||
    upload?.category ||
    upload?.kind;
  return CATEGORY_LABELS[String(raw).toLowerCase()] || 'Документ';
};

const getDocumentLabel = (upload) => {
  if (!upload || typeof upload !== 'object') return 'Документ';
  const label =
    upload.documentLabel ||
    upload.verificationLabel ||
    DOCUMENT_TYPE_LABELS[String(upload.documentType || upload.verificationType).toLowerCase()];
  return label || 'Документ';
};

export default function VerificationHistoryBlock() {
  const ctx = useAuth?.() || {};
  const uploads =
    (ctx.user?.verificationUploads) ??
    (ctx.auth?.verificationUploads) ??
    [];

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">История загрузок</Card.Title>

        {uploads.length === 0 ? (
          <div className="text-secondary">Пока нет загрузок.</div>
        ) : (
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th style={{ width: 220 }}>Когда</th>
                <th style={{ width: 220 }}>Назначение</th>
                <th>Документ</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((u) => (
                <tr key={u.id}>
                  <td>{new Date(u.uploadedAt).toLocaleString('ru-RU')}</td>
                  <td>{getCategoryLabel(u)}</td>
                  <td>
                    <div className="fw-medium">{getDocumentLabel(u)}</div>
                    <div className="text-secondary small text-truncate">{u.name}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}
