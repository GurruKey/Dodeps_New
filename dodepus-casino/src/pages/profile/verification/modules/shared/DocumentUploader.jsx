import { useMemo, useRef, useState } from 'react';
import { Card, Form, Alert } from 'react-bootstrap';
import { Upload, Lock } from 'lucide-react';
import { useVerificationState } from '../../state/useVerificationState.js';
import { useVerificationActions } from '../../actions/useVerificationActions.js';

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Не удалось прочитать выбранный файл.'));
    reader.readAsDataURL(file);
  });

export function DocumentUploader({ layout = 'card', config }) {
  const settings = config || {};
  const category = settings.category || 'identity';
  const heading = settings.heading || 'Документ';
  const lockKey = settings.lockKey || 'doc';
  const lockMessage =
    settings.lockMessage || 'Запрос обрабатывается. Загрузка станет доступна после решения администратора.';
  const helperText = settings.helperText || '';

  const fileRef = useRef(null);
  const { locks } = useVerificationState();
  const { addVerificationUpload } = useVerificationActions();

  const [documentType, setDocumentType] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const isLocked = Boolean(locks?.[lockKey]);
  const documentOptions = useMemo(
    () => (Array.isArray(settings.options) ? settings.options : []),
    [settings.options],
  );

  const onPick = () => {
    if (isLocked) {
      return;
    }
    fileRef.current?.click();
  };

  const onChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!documentType) {
      setError('Выберите вид документа перед загрузкой файла.');
      event.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      await Promise.resolve(
        addVerificationUpload?.({
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            dataUrl,
            previewUrl: dataUrl,
          },
          verificationKind: category,
          verificationType: documentType,
          verificationLabel: documentOptions.find((option) => option.value === documentType)?.label,
        }),
      );
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить документ.';
      setError(message);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const formContent = (
    <>
      <div className="d-grid gap-3">
        <Form.Group>
          <Form.Label className="fw-medium">Вид документа</Form.Label>
          <Form.Select
            value={documentType}
            onChange={(event) => {
              setDocumentType(event.target.value);
              setError('');
            }}
            aria-label="Выберите документ для загрузки"
            disabled={isLocked}
          >
            <option value="" disabled hidden>
              Выберите из списка
            </option>
            {documentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
          {helperText ? <Form.Text className="text-secondary">{helperText}</Form.Text> : null}
        </Form.Group>
      </div>

      <div
        role={isLocked ? 'note' : 'button'}
        onClick={onPick}
        className={`w-100 d-flex align-items-center justify-content-center rounded-3 p-5 text-center border border-2 border-secondary-subtle ${
          isLocked ? 'bg-body-tertiary' : ''
        }`}
        style={{ borderStyle: 'dashed', cursor: isLocked ? 'not-allowed' : 'pointer' }}
      >
        <div className="d-flex flex-column align-items-center gap-2">
          {isLocked ? <Lock className="text-secondary" /> : <Upload className="text-secondary" />}
          <div className="fw-medium">
            {isLocked ? 'Загрузка временно недоступна' : 'Нажмите, чтобы выбрать документ'}
          </div>
          <div className="text-secondary small">
            {isLocked ? lockMessage : 'Поддержка: PDF, JPG, PNG, WEBP'}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mt-3 mb-0">
          {error}
        </Alert>
      )}

      <Form.Control
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="d-none"
        onChange={onChange}
        disabled={isUploading || isLocked}
      />
    </>
  );

  if (layout === 'plain') {
    return (
      <div className="d-grid gap-3">
        <div className="fw-semibold fs-5">{heading}</div>
        {formContent}
      </div>
    );
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">{heading}</Card.Title>
        {formContent}
      </Card.Body>
    </Card>
  );
}

export default DocumentUploader;
