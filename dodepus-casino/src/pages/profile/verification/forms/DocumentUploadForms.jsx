import { useMemo, useRef, useState } from 'react';
import { Card, Form, Alert } from 'react-bootstrap';
import { Upload, Lock } from 'lucide-react';
import { useVerificationState } from '../state/useVerificationState.js';
import { useVerificationActions } from '../actions/useVerificationActions.js';

const CATEGORY_CONFIG = {
  identity: {
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
  },
  address: {
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
  },
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Не удалось прочитать выбранный файл.'));
    reader.readAsDataURL(file);
  });

function DocumentUploader({ layout = 'card', category }) {
  const config = CATEGORY_CONFIG[category];
  const fileRef = useRef(null);
  const { locks } = useVerificationState();
  const { addVerificationUpload } = useVerificationActions();

  const [documentType, setDocumentType] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const isLocked = Boolean(locks?.[config.lockKey]);

  const documentOptions = useMemo(() => config.options, [config.options]);

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
          <Form.Text className="text-secondary">{config.helperText}</Form.Text>
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
            {isLocked ? config.lockMessage : 'Поддержка: PDF, JPG, PNG, WEBP'}
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
        <div className="fw-semibold fs-5">{config.heading}</div>
        {formContent}
      </div>
    );
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">{config.heading}</Card.Title>
        {formContent}
      </Card.Body>
    </Card>
  );
}

export function IdentityDocumentUploadForm(props) {
  return <DocumentUploader category="identity" {...props} />;
}

export function AddressDocumentUploadForm(props) {
  return <DocumentUploader category="address" {...props} />;
}

export default IdentityDocumentUploadForm;
