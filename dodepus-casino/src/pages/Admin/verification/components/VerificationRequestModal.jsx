import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Button,
  Form,
  Badge,
  Stack,
  Row,
  Col,
  ListGroup,
  Placeholder,
  Alert,
} from 'react-bootstrap';
import { Eye } from 'lucide-react';
import { FIELD_LABELS, formatDateTime, getStatusLabel } from '../utils.js';

const EMPTY_FIELDS = Object.freeze({ email: false, phone: false, address: false, doc: false });
const FIELD_KEYS = Object.freeze(Object.keys(FIELD_LABELS));

const normalizeFieldState = (fields = {}) => ({
  email: Boolean(fields?.email),
  phone: Boolean(fields?.phone),
  address: Boolean(fields?.address),
  doc: Boolean(fields?.doc),
});

const buildCompletedSelection = (request) => {
  if (!request) {
    return { ...EMPTY_FIELDS };
  }

  const completed = normalizeFieldState(request.completedFields);
  const requested = normalizeFieldState(request.requestedFields);

  const next = { ...EMPTY_FIELDS };

  FIELD_KEYS.forEach((key) => {
    if (completed[key]) {
      next[key] = true;
      return;
    }

    if (requested[key]) {
      next[key] = false;
    }
  });

  return next;
};

const buildRejectedSelection = (request) => {
  if (!request) {
    return { ...EMPTY_FIELDS };
  }

  const requested = normalizeFieldState(request.requestedFields);
  const completed = normalizeFieldState(request.completedFields);

  const next = { ...EMPTY_FIELDS };

  FIELD_KEYS.forEach((key) => {
    if (requested[key] && !completed[key]) {
      next[key] = true;
    }
  });

  return next;
};

const buildProfileDraft = (request) => {
  const source = request?.profile ?? {};
  return {
    address: source.address || '',
    city: source.city || '',
    country: source.country || '',
    firstName: source.firstName || '',
    lastName: source.lastName || '',
    dob: source.dob || '',
    gender: source.gender || 'unspecified',
  };
};

const formatFileSize = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '';
  }

  if (numeric >= 1024 * 1024) {
    return `${(numeric / (1024 * 1024)).toFixed(1)} МБ`;
  }

  if (numeric >= 1024) {
    return `${(numeric / 1024).toFixed(1)} КБ`;
  }

  return `${numeric} Б`;
};

const GENDER_OPTIONS = [
  { value: 'male', label: 'Мужчина' },
  { value: 'female', label: 'Женщина' },
  { value: 'unspecified', label: 'Не указан' },
  { value: 'other', label: 'Другое' },
];

const STATUS_VARIANT = Object.freeze({
  pending: 'warning',
  partial: 'info',
  rejected: 'danger',
  approved: 'success',
});

export default function VerificationRequestModal({
  show = false,
  request = null,
  onClose,
  onConfirm,
  onReject,
  busy = false,
}) {
  const initialMode = request?.status === 'approved' ? 'view' : 'approve';
  const [mode, setMode] = useState(initialMode);
  const [completedSelection, setCompletedSelection] = useState(() =>
    buildCompletedSelection(request),
  );
  const [rejectedSelection, setRejectedSelection] = useState(() =>
    buildRejectedSelection(request),
  );
  const [notes, setNotes] = useState(() => request?.notes || '');
  const [profileDraft, setProfileDraft] = useState(() => buildProfileDraft(request));
  const [formError, setFormError] = useState('');
  const [historyLimit, setHistoryLimit] = useState(3);

  useEffect(() => {
    const nextMode = request?.status === 'approved' ? 'view' : 'approve';
    setMode(nextMode);
    setCompletedSelection(buildCompletedSelection(request));
    setRejectedSelection(buildRejectedSelection(request));
    setNotes(request?.notes || '');
    setProfileDraft(buildProfileDraft(request));
    setFormError('');
    setHistoryLimit(3);
  }, [request]);

  useEffect(() => {
    if (!show) {
      setFormError('');
    }
  }, [show]);

  const requestedFields = useMemo(() => normalizeFieldState(request?.requestedFields), [request]);
  const completedFields = useMemo(() => normalizeFieldState(request?.completedFields), [request]);

  const isApproved = request?.status === 'approved';
  const canEditProfile = mode === 'approve' || mode === 'reject';
  const activeSelection = mode === 'reject' ? rejectedSelection : completedSelection;
  const hasCompletedSelection = useMemo(
    () => Object.values(completedSelection).some(Boolean),
    [completedSelection],
  );
  const hasRejectedSelection = useMemo(
    () => Object.values(rejectedSelection).some(Boolean),
    [rejectedSelection],
  );

  const handleToggleField = (key) => {
    if (busy || mode === 'view') {
      return;
    }

    setFormError('');

    if (mode === 'reject') {
      setRejectedSelection((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
      return;
    }

    setCompletedSelection((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProfileChange = (key, value) => {
    if (!canEditProfile) return;
    setProfileDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleConfirm = () => {
    if (!request) return;

    if (mode === 'reject') {
      setMode('approve');
      setFormError('');
      return;
    }

    if (!hasCompletedSelection) {
      setFormError('Отметьте поля, которые готовы к подтверждению.');
      return;
    }

    onConfirm?.({
      completedFields: completedSelection,
      notes,
      profilePatch: profileDraft,
    });
  };

  const enterRejectMode = () => {
    setMode('reject');
    setRejectedSelection(buildRejectedSelection(request));
    setFormError('');
  };

  const handleReject = () => {
    if (!request) return;

    if (mode !== 'reject') {
      enterRejectMode();
      return;
    }

    if (!hasRejectedSelection) {
      setFormError('Выберите пункт(ы), по которым требуется отказ.');
      return;
    }

    onReject?.({
      requestedFields: rejectedSelection,
      notes,
      profilePatch: profileDraft,
    });
  };

  const handleCancelReject = () => {
    setMode(isApproved ? 'view' : 'approve');
    setRejectedSelection(buildRejectedSelection(request));
    setFormError('');
  };

  const statusVariant = STATUS_VARIANT[request?.status] || 'secondary';

  const historyEntries = useMemo(() => {
    if (!Array.isArray(request?.history)) {
      return [];
    }
    return request.history;
  }, [request]);

  const visibleHistory = historyEntries.slice(0, historyLimit);
  const remainingHistory = Math.max(historyEntries.length - historyLimit, 0);
  const handleExpandHistory = () => {
    setHistoryLimit((prev) => Math.min(prev + 10, historyEntries.length));
  };

  const attachments = Array.isArray(request?.attachments) ? request.attachments : [];

  const renderFieldLabel = (key) => {
    if (mode === 'reject') {
      return activeSelection[key] ? 'Отказ по пункту' : 'Оставить без изменений';
    }

    return activeSelection[key] ? 'Готово' : 'Требует проверки';
  };

  const isFieldToggleDisabled = (key) => {
    if (busy || mode === 'view') {
      return true;
    }

    if (mode === 'approve') {
      const isRequested = requestedFields[key];
      const isCompleted = completedFields[key];
      return !isRequested && !isCompleted;
    }

    return false;
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton={!busy}>
        <Modal.Title className="d-flex flex-column gap-1">
          <span>Верификация аккаунта {request?.userId ?? '—'}</span>
          <Badge bg={statusVariant} className="align-self-start">
            {getStatusLabel(request?.status)}
          </Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!request ? (
          <Placeholder as="div" animation="glow">
            <Placeholder xs={12} className="mb-2" />
            <Placeholder xs={10} className="mb-2" />
            <Placeholder xs={8} className="mb-2" />
          </Placeholder>
        ) : (
          <Stack gap={4}>
            <section>
              <h5 className="mb-3">Контакты и статус</h5>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <div className="text-muted small">Почта</div>
                  <div>{request.userEmail || '—'}</div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="text-muted small">Телефон</div>
                  <div>{request.userPhone || '—'}</div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="text-muted small">Отправлено</div>
                  <div>{formatDateTime(request.submittedAt)}</div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="text-muted small">Обновлено</div>
                  <div>{formatDateTime(request.updatedAt)}</div>
                </Col>
              </Row>
            </section>

            <section>
              <h5 className="mb-3">Поля для проверки</h5>
              <Stack gap={3}>
                {formError ? (
                  <Alert variant="danger" className="mb-0">
                    {formError}
                  </Alert>
                ) : null}
                {mode === 'reject' ? (
                  <Alert variant="warning" className="mb-0">
                    Выберите пункты, по которым необходимо отказать пользователю.
                  </Alert>
                ) : null}
                {isApproved && mode === 'view' ? (
                  <Alert variant="info" className="mb-0">
                    Запрос уже подтверждён. Чтобы изменить решение, нажмите «Отказать».
                  </Alert>
                ) : null}

                {FIELD_KEYS.map((key) => {
                  const label = FIELD_LABELS[key];
                  const isRequested = requestedFields[key];
                  const isCompleted = completedFields[key];
                  return (
                    <div key={key} className="border rounded p-3">
                      <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                        <div>
                          <div className="fw-semibold">{label}</div>
                          <div className="text-muted small">
                            {isRequested
                              ? 'Запрошено администратором'
                              : 'Не запрошено'}
                          </div>
                        </div>
                        <Form.Check
                          type="switch"
                          id={`verify-${key}`}
                          label={renderFieldLabel(key)}
                          checked={Boolean(activeSelection[key])}
                          disabled={isFieldToggleDisabled(key)}
                          onChange={() => handleToggleField(key)}
                        />
                      </div>

                      {key === 'address' ? (
                        <Row className="g-2 mt-3">
                          <Col xs={12}>
                            <Form.Label className="small text-muted">Адрес</Form.Label>
                            <Form.Control
                              value={profileDraft.address}
                              onChange={(event) =>
                                handleProfileChange('address', event.target.value)
                              }
                              placeholder="Введите адрес клиента"
                              disabled={busy || !canEditProfile}
                            />
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Label className="small text-muted">Город</Form.Label>
                            <Form.Control
                              value={profileDraft.city}
                              onChange={(event) =>
                                handleProfileChange('city', event.target.value)
                              }
                              placeholder="Город"
                              disabled={busy || !canEditProfile}
                            />
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Label className="small text-muted">Страна</Form.Label>
                            <Form.Control
                              value={profileDraft.country}
                              onChange={(event) =>
                                handleProfileChange('country', event.target.value)
                              }
                              placeholder="Страна"
                              disabled={busy || !canEditProfile}
                            />
                          </Col>
                        </Row>
                      ) : null}

                      {key === 'doc' ? (
                        <Row className="g-2 mt-3">
                          <Col xs={12} md={6}>
                            <Form.Label className="small text-muted">Имя</Form.Label>
                            <Form.Control
                              value={profileDraft.firstName}
                              onChange={(event) =>
                                handleProfileChange('firstName', event.target.value)
                              }
                              placeholder="Имя"
                              disabled={busy || !canEditProfile}
                            />
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Label className="small text-muted">Фамилия</Form.Label>
                            <Form.Control
                              value={profileDraft.lastName}
                              onChange={(event) =>
                                handleProfileChange('lastName', event.target.value)
                              }
                              placeholder="Фамилия"
                              disabled={busy || !canEditProfile}
                            />
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Label className="small text-muted">Дата рождения</Form.Label>
                            <Form.Control
                              type="date"
                              value={profileDraft.dob || ''}
                              onChange={(event) => handleProfileChange('dob', event.target.value)}
                              disabled={busy || !canEditProfile}
                            />
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Label className="small text-muted">Пол</Form.Label>
                            <Form.Select
                              value={profileDraft.gender || 'unspecified'}
                              onChange={(event) => handleProfileChange('gender', event.target.value)}
                              disabled={busy || !canEditProfile}
                            >
                              {GENDER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Form.Select>
                          </Col>
                        </Row>
                      ) : null}
                    </div>
                  );
                })}
              </Stack>
            </section>

            {attachments.length > 0 ? (
              <section>
                <h5 className="mb-3">Документы пользователя</h5>
                <ListGroup>
                  {attachments.map((file) => {
                    const previewUrl = (() => {
                      if (typeof file?.previewUrl === 'string' && file.previewUrl) {
                        return file.previewUrl;
                      }
                      if (typeof file?.dataUrl === 'string' && file.dataUrl) {
                        return file.dataUrl;
                      }
                      if (typeof file?.url === 'string' && file.url) {
                        return file.url;
                      }
                      if (typeof file?.path === 'string' && file.path) {
                        return file.path;
                      }
                      return '';
                    })();

                    return (
                      <ListGroup.Item key={file.id || file.name}>
                        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{file.name || 'document'}</div>
                            {file.documentLabel ? (
                              <div className="text-muted small">{file.documentLabel}</div>
                            ) : null}
                            <div className="text-muted small">
                              {file.type ? `${file.type} · ` : ''}
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                          <div className="d-flex flex-column align-items-start align-items-lg-end gap-2">
                            <div className="text-muted small">
                              Загружено {formatDateTime(file.uploadedAt)}
                            </div>
                            {previewUrl ? (
                              <Button
                                as="a"
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline-primary"
                                size="sm"
                              >
                                <Eye size={16} className="me-2" /> Просмотреть
                              </Button>
                            ) : (
                              <div className="text-muted small">Предпросмотр недоступен</div>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </section>
            ) : null}

            <section>
              <h5 className="mb-3">Комментарий администратора</h5>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Добавьте комментарий к решению"
                disabled={busy || !canEditProfile}
              />
            </section>

            {visibleHistory.length > 0 ? (
              <section>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="mb-0">История решений</h5>
                  {remainingHistory > 0 ? (
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={handleExpandHistory}
                    >
                      Развернуть (+ ещё {Math.min(remainingHistory, 10)} комментариев)
                    </Button>
                  ) : null}
                </div>
                <ListGroup variant="flush">
                  {visibleHistory.map((entry) => (
                    <ListGroup.Item key={entry.id} className="px-0">
                      <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between">
                        <div>
                          <div className="fw-semibold">{entry.reviewer?.name || 'Администратор'}</div>
                          <div className="text-muted small">
                            {formatDateTime(entry.updatedAt)} · {getStatusLabel(entry.status)}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          {entry.notes ? (
                            <div className="text-body">{entry.notes}</div>
                          ) : (
                            <div className="text-muted small">Без комментария</div>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </section>
            ) : null}
          </Stack>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-content-between flex-column flex-md-row gap-2">
        <Button variant="outline-secondary" onClick={onClose} disabled={busy}>
          Назад
        </Button>
        <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch">
          {mode === 'reject' ? (
            <Button
              variant="link"
              className="text-decoration-none"
              onClick={handleCancelReject}
              disabled={busy}
            >
              Отменить отказ
            </Button>
          ) : null}
          <Button
            variant="outline-danger"
            onClick={handleReject}
            disabled={busy || !request}
          >
            {mode === 'reject' ? 'Подтвердить отказ' : 'Отказать'}
          </Button>
          {!isApproved ? (
            <Button
              variant="success"
              onClick={handleConfirm}
              disabled={
                busy ||
                !request ||
                mode !== 'approve' ||
                !hasCompletedSelection
              }
            >
              Подтвердить
            </Button>
          ) : null}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
