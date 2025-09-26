import { Card, Form } from 'react-bootstrap';
import { Upload } from 'lucide-react';
import { useRef } from 'react';
import { useAuth } from '../../../../app/AuthContext.jsx';

export default function VerificationUploadBlock() {
  const ctx = useAuth?.() || {};
  const addVerificationUpload = ctx.addVerificationUpload;
  const fileRef = useRef(null);

  const onPick = () => fileRef.current?.click();
  const onChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addVerificationUpload?.(file);
    e.target.value = ''; // позволить выбрать тот же файл повторно
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Загрузка документов</Card.Title>

        <div
          role="button"
          onClick={onPick}
          className="w-100 d-flex align-items-center justify-content-center rounded-3 p-5 text-center border border-2 border-secondary-subtle"
          style={{ borderStyle: 'dashed' }}
        >
          <div>
            <Upload className="mb-2" />
            <div className="fw-medium">Нажмите, чтобы выбрать документ</div>
            <div className="text-secondary small">Поддержка: PDF, JPG, PNG, WEBP</div>
          </div>
        </div>

        <Form.Control
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="d-none"
          onChange={onChange}
        />
      </Card.Body>
    </Card>
  );
}
