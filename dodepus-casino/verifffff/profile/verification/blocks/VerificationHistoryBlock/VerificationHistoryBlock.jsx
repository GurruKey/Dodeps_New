import { useMemo } from 'react';
import { Card, Table } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';
import {
  buildVerificationTimeline,
  formatModuleList,
  VERIFICATION_STATUS_LABELS,
} from '../../../../../shared/verification/index.js';

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

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('ru-RU');
    }
  } catch (error) {
    console.warn('Failed to format verification history date', error);
  }
  return value || '—';
};

const getStatusLabel = (event) => {
  if (event.type === 'submitted') {
    return 'Запрос отправлен';
  }

  if (event.type === 'reset' || event.status === 'reset') {
    return 'Статусы сброшены';
  }

  const status = String(event.status || '').toLowerCase();
  return VERIFICATION_STATUS_LABELS[status] || 'Обновление';
};

export default function VerificationHistoryBlock() {
  const ctx = useAuth?.() || {};
  const user = ctx.user || ctx.auth || {};
  const uploads = Array.isArray(user?.verificationUploads) ? user.verificationUploads : [];
  const timeline = useMemo(
    () => buildVerificationTimeline(user?.verificationRequests),
    [user?.verificationRequests],
  );

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">История</Card.Title>

        <div className="d-grid gap-4">
          <div>
            <h6 className="fw-semibold mb-2">Решения и заявки</h6>
            {timeline.length === 0 ? (
              <div className="text-secondary">История пока отсутствует.</div>
            ) : (
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 220 }}>Когда</th>
                    <th style={{ width: 220 }}>Статус</th>
                    <th style={{ width: 220 }}>Модули</th>
                    <th>Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((event) => (
                    <tr key={event.id}>
                      <td>{formatDateTime(event.updatedAt)}</td>
                      <td>{getStatusLabel(event)}</td>
                      <td>{formatModuleList(event.modules) || '—'}</td>
                      <td>{event.notes ? <span>{event.notes}</span> : <span className="text-secondary">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>

          <div>
            <h6 className="fw-semibold mb-2">Загруженные документы</h6>
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
                      <td>{formatDateTime(u.uploadedAt)}</td>
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
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
