import { Card, Form, Alert } from 'react-bootstrap';
import { Upload } from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
import { useAuth } from '../../../../../app/AuthContext.jsx';

export default function VerificationUploadBlock() {
  const ctx = useAuth?.() || {};
  const addVerificationUpload = ctx.addVerificationUpload;
  const fileRef = useRef(null);
  const [category, setCategory] = useState('identity');
  const [documentType, setDocumentType] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Не удалось прочитать выбранный файл.'));
      reader.readAsDataURL(file);
    });

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

  const onPick = () => fileRef.current?.click();
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

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Загрузка документов</Card.Title>

        <div className="d-grid gap-3">
          <Form.Group>
            <Form.Label className="fw-medium">Что подтверждаем?</Form.Label>
            <Form.Select value={category} onChange={onCategoryChange}>
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
                Подтвердить адрес можно интернет-выпиской или банковской выпиской с
                заретушированными данными карт.
              </Form.Text>
            ) : (
              <Form.Text className="text-secondary">
                Подойдут ID-карта, заграничный или внутренний паспорт, вид на
                жительство.
              </Form.Text>
            )}
          </Form.Group>
        </div>

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
          disabled={isUploading}
        />
      </Card.Body>
    </Card>
  );
}
