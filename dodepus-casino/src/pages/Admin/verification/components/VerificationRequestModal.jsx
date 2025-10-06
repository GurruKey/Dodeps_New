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
} from 'react-bootstrap';
import { FIELD_LABELS, formatDateTime, getStatusLabel } from '../utils.js';

const EMPTY_FIELDS = Object.freeze({ email: false, phone: false, address: false, doc: false });

const normalizeFieldState = (fields = {}) => ({
  email: Boolean(fields?.email),
  phone: Boolean(fields?.phone),
  address: Boolean(fields?.address),
  doc: Boolean(fields?.doc),
});

const buildInitialSelectedFields = (request, intent) => {
  if (!request) {
    return { ...EMPTY_FIELDS };
  }

  const completed = normalizeFieldState(request.completedFields);
  const requested = normalizeFieldState(request.requestedFields);

  const next = { ...EMPTY_FIELDS };

  Object.keys(next).forEach((key) => {
    if (completed[key]) {
      next[key] = true;
      return;
    }

    if (requested[key]) {
      next[key] = intent === 'reject' ? false : true;
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

const fieldOrder = Object.keys(FIELD_LABELS);

export default function VerificationRequestModal({
  show = false,
  request = null,
  intent = 'view',
  onClose,
  onConfirm,
  onReject,
  busy = false,
}) {
  const [selectedFields, setSelectedFields] = useState(() =>
    buildInitialSelectedFields(request, intent),
  );
  const [notes, setNotes] = useState(() => request?.notes || '');
  const [profileDraft, setProfileDraft] = useState(() => buildProfileDraft(request));

  useEffect(() => {
    setSelectedFields(buildInitialSelectedFields(request, intent));
    setNotes(request?.notes || '');
    setProfileDraft(buildProfileDraft(request));
  }, [request, intent]);

  const requestedFields = useMemo(() => normalizeFieldState(request?.requestedFields), [request]);
  const completedFields = useMemo(() => normalizeFieldState(request?.completedFields), [request]);

  const hasAnySelection = useMemo(
    () => Object.values(selectedFields).some(Boolean),
    [selectedFields],
  );

  const handleToggleField = (key) => {
    setSelectedFields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProfileChange = (key, value) => {
    setProfileDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleConfirm = () => {
    if (!request) return;
    onConfirm?.({
      completedFields: selectedFields,
      notes,
      profilePatch: profileDraft,
    });
  };

  const handleReject = () => {
    if (!request) return;
    onReject?.({
      completedFields: selectedFields,
      notes,
      profilePatch: profileDraft,
    });
  };

  const statusVariant = STATUS_VARIANT[request?.status] || 'secondary';

  const historyEntries = useMemo(() => {
    if (!Array.isArray(request?.history)) {
      return [];
    }
    return request.history;
  }, [request]);

  const attachments = Array.isArray(request?.attachments) ? request.attachments : [];

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
                {fieldOrder.map((key) => {
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
                          label={selectedFields[key] ? 'Готово' : 'Требует проверки'}
                          checked={selectedFields[key]}
                          disabled={!isRequested && !isCompleted}
                          onChange={() => handleToggleField(key)}
                        />
                      </div>

                      {key === 'address' ? (
                        <Row className="g-2 mt-3">
                          <Col xs={12}>
                            <Form.Label className="small text-muted">Адрес</Form.Label>
                            <Form.Control
                              value={profileDraft.address}
                              onChange={(event) => handleProfileChange('address', event.target.value)}
                              placeholder="Введите адрес клиента"
                              disabled={busy}
                            />
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Label className="small text-muted">Город</Form.Label>
                            <Form.Control
                              value={profileDraft.city}
                              onChange={(event) => handleProfileChange('city', event.target.value)}
                              placeholder="Город"
                              disabled={busy}
                            />
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Label className="small text-muted">Страна</Form.Label>
                            <Form.Control
                              value={profileDraft.country}
                              onChange={(event) => handleProfileChange('country', event.target.value)}
                              placeholder="Страна"
                              disabled={busy}
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
                              onChange={(event) => handleProfileChange('firstName', event.target.value)}
                              placeholder="Имя"
                              disabled={busy}
                            />
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Label className="small text-muted">Фамилия</Form.Label>
                            <Form.Control
                              value={profileDraft.lastName}
                              onChange={(event) => handleProfileChange('lastName', event.target.value)}
                              placeholder="Фамилия"
                              disabled={busy}
                            />
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Label className="small text-muted">Дата рождения</Form.Label>
                            <Form.Control
                              type="date"
                              value={profileDraft.dob || ''}
                              onChange={(event) => handleProfileChange('dob', event.target.value)}
                              disabled={busy}
                            />
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Label className="small text-muted">Пол</Form.Label>
                            <Form.Select
                              value={profileDraft.gender || 'unspecified'}
                              onChange={(event) => handleProfileChange('gender', event.target.value)}
                              disabled={busy}
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
                  {attachments.map((file) => (
                    <ListGroup.Item key={file.id || file.name}>
                      <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                        <div>
                          <div className="fw-semibold">{file.name || 'document'}</div>
                          {file.documentLabel ? (
                            <div className="text-muted small">{file.documentLabel}</div>
                          ) : null}
                        </div>
                        <div className="text-muted small">
                          Загружено {formatDateTime(file.uploadedAt)}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
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
                disabled={busy}
              />
            </section>

            {historyEntries.length > 0 ? (
              <section>
                <h5 className="mb-3">История решений</h5>
                <ListGroup variant="flush">
                  {historyEntries.map((entry) => (
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
        <div className="d-flex flex-column flex-sm-row gap-2">
          <Button
            variant="outline-danger"
            onClick={handleReject}
            disabled={busy || !request}
          >
            Отказать
          </Button>
          <Button
            variant="success"
            onClick={handleConfirm}
            disabled={busy || !request || !hasAnySelection}
          >
            Подтвердить
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
