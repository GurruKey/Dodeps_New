import { useMemo, useRef, useState } from 'react';
import { Card, Form, Alert } from 'react-bootstrap';
import { Upload, Lock } from 'lucide-react';
import { useVerificationState } from '../state/useVerificationState.js';
import { useVerificationActions } from '../actions/useVerificationActions.js';

export function DocumentsVerificationForm({ layout = 'card' }) {
  const fileRef = useRef(null);
  const { locks } = useVerificationState();
  const { addVerificationUpload } = useVerificationActions();

  const [category, setCategory] = useState('identity');
  const [documentType, setDocumentType] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const categoryOptions = useMemo(
    () => [
      { value: 'address', label: 'Подтверждение адреса' },
      { value: 'identity', label: 'Подтверждение личности' },
    ],
    [],
  );

  const addressDocumentOptions = useMemo(
    () => [
      { value: 'internet_statement', label: 'Интернет-выписка' },
      { value: 'bank_statement', label: 'Банковская выписка' },
    ],
    [],
  );

  const identityDocumentOptions = useMemo(
    () => [
      { value: 'id_card', label: 'ID-карта' },
      { value: 'foreign_passport', label: 'Заграничный паспорт' },
      { value: 'internal_passport', label: 'Внутренний паспорт' },
      { value: 'residence_permit', label: 'Вид на жительство' },
    ],
    [],
  );

  const documentOptions = category === 'address' ? addressDocumentOptions : identityDocumentOptions;
  const selectedDocument = documentOptions.find((option) => option.value === documentType) || null;

  const isCategoryLocked = category === 'address' ? locks.address : locks.doc;
  const lockMessage = category === 'address'
    ? 'Отправленный адрес проверяется. Дождитесь решения или отмените запрос, чтобы загрузить новый документ.'
    : 'Запрос по документам обрабатывается. После отмены или решения администратора загрузка станет доступна снова.';

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Не удалось прочитать выбранный файл.'));
      reader.readAsDataURL(file);
    });

  const onPick = () => {
    if (isCategoryLocked) {
      return;
    }
    fileRef.current?.click();
  };

  const onCategoryChange = (event) => {
    setCategory(event.target.value);
    setDocumentType('');
    setError('');
  };

  const onDocumentTypeChange = (event) => {
    setDocumentType(event.target.value);
    setError('');
  };

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!documentType) {
      setError('Выберите вид документа перед загрузкой файла.');
      e.target.value = '';
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
          verificationLabel: selectedDocument?.label,
        }),
      );
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить документ.';
      setError(message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const formContent = (
    <>
      <div className="d-grid gap-3">
        <Form.Group>
          <Form.Label className="fw-medium">Что подтверждаем?</Form.Label>
          <Form.Select value={category} onChange={onCategoryChange} disabled={isCategoryLocked}>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label className="fw-medium">Вид документа</Form.Label>
          <Form.Select
            value={documentType}
            onChange={onDocumentTypeChange}
            aria-label="Выберите документ для подтверждения"
            disabled={isCategoryLocked}
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
          {category === 'address' ? (
            <Form.Text className="text-secondary">
              Подтвердить адрес можно интернет-выпиской или банковской выпиской с заретушированными данными карт.
            </Form.Text>
          ) : (
            <Form.Text className="text-secondary">
              Подойдут ID-карта, заграничный или внутренний паспорт, вид на жительство.
            </Form.Text>
          )}
        </Form.Group>
      </div>

      <div
        role={isCategoryLocked ? 'note' : 'button'}
        onClick={onPick}
        className={`w-100 d-flex align-items-center justify-content-center rounded-3 p-5 text-center border border-2 border-secondary-subtle ${
          isCategoryLocked ? 'bg-body-tertiary' : ''
        }`}
        style={{ borderStyle: 'dashed', cursor: isCategoryLocked ? 'not-allowed' : 'pointer' }}
      >
        <div className="d-flex flex-column align-items-center gap-2">
          {isCategoryLocked ? <Lock className="text-secondary" /> : <Upload className="text-secondary" />}
          <div className="fw-medium">
            {isCategoryLocked ? 'Загрузка временно недоступна' : 'Нажмите, чтобы выбрать документ'}
          </div>
          <div className="text-secondary small">
            {isCategoryLocked ? lockMessage : 'Поддержка: PDF, JPG, PNG, WEBP'}
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
        disabled={isUploading || isCategoryLocked}
      />
    </>
  );

  if (layout === 'plain') {
    return (
      <div className="d-grid gap-3">
        <div className="fw-semibold fs-5">Загрузка документов</div>
        {formContent}
      </div>
    );
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Загрузка документов</Card.Title>
        {formContent}
      </Card.Body>
    </Card>
  );
}

export const DocumentUploadForm = DocumentsVerificationForm;
