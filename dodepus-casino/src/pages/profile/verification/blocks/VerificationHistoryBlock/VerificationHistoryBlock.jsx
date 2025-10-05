import { Card, Table } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';

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
                <th>Название документа</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((u) => (
                <tr key={u.id}>
                  <td>{new Date(u.uploadedAt).toLocaleString('ru-RU')}</td>
                  <td className="text-truncate">{u.name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}
