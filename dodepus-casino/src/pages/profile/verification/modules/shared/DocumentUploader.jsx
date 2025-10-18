import { useMemo, useRef, useState } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { Upload, Lock } from 'lucide-react';
import { useVerificationState } from '@/pages/profile/verification/state';
import { useVerificationActions } from '@/pages/profile/verification/actions';
import { VerificationFormLayout } from './VerificationFormLayout.jsx';

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
        <Form.Group className="d-grid gap-2">
          <Form.Label className="fw-medium">Вид документа</Form.Label>
          {helperText ? <Form.Text className="text-secondary">{helperText}</Form.Text> : null}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-2">
            {documentOptions.map((option) => {
              const optionId = `${category}-document-${option.value}`;
              const isSelected = documentType === option.value;
              const tileClasses = [
                'btn',
                'w-100',
                'h-100',
                'py-3',
                'text-start',
                'border',
                'border-2',
                'rounded-3',
                'fw-medium',
              ];

              if (isSelected) {
                tileClasses.push('btn-primary', 'border-primary', 'shadow-sm');
              } else {
                tileClasses.push('btn-outline-secondary', 'border-secondary-subtle', 'bg-white');
              }

              if (isLocked) {
                tileClasses.push('disabled');
              }

              return (
                <div className="col" key={option.value}>
                  <input
                    type="radio"
                    className="btn-check"
                    name={`document-type-${category}`}
                    id={optionId}
                    value={option.value}
                    checked={isSelected}
                    onChange={(event) => {
                      setDocumentType(event.target.value);
                      setError('');
                    }}
                    disabled={isLocked}
                    autoComplete="off"
                  />
                  <label
                    htmlFor={optionId}
                    className={tileClasses.join(' ')}
                    style={{ minHeight: '4.5rem', whiteSpace: 'normal' }}
                    aria-disabled={isLocked}
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
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

  return (
    <VerificationFormLayout title={heading} layout={layout}>
      {formContent}
    </VerificationFormLayout>
  );
}

export default DocumentUploader;
