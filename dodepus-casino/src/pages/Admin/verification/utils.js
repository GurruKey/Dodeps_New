const ensureString = (value) => (typeof value === 'string' ? value.trim() : '');

export const FIELD_LABELS = Object.freeze({
  email: 'Почта',
  phone: 'Телефон',
  address: 'Адрес',
  doc: 'Документ',
});

export const formatDateTime = (value, { withTime = true } = {}) => {
  if (!value) return '—';

  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      if (withTime) {
        return date.toLocaleString('ru-RU');
      }
      return date.toLocaleDateString('ru-RU');
    }
  } catch (error) {
    console.warn('Failed to format verification date', error);
  }

  return value;
};

export const getProgressLabel = ({ completedCount = 0, totalFields = 0 } = {}) => {
  const total = Number.isFinite(Number(totalFields)) ? Number(totalFields) : 0;
  const completed = Number.isFinite(Number(completedCount)) ? Number(completedCount) : 0;
  return `${Math.max(0, completed)} / ${Math.max(0, total)}`;
};

const resolveFieldState = ({ done = false, status = 'pending', requested = false }) => {
  if (done) {
    return 'approved';
  }

  if (status === 'rejected') {
    return requested ? 'rejected' : 'idle';
  }

  if (requested) {
    return 'pending';
  }

  return 'idle';
};

const resolveFieldVariant = (state) => {
  switch (state) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
};

export const getFieldEntries = (fields = {}, { status, requested } = {}) => {
  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : '';
  const requestedFields = requested && typeof requested === 'object' ? requested : null;

  return Object.entries(FIELD_LABELS).map(([key, label]) => {
    const done = Boolean(fields?.[key]);
    const isRequested = Boolean(requestedFields ? requestedFields[key] : done);
    const state = resolveFieldState({ done, status: normalizedStatus, requested: isRequested });

    return {
      key,
      label,
      state,
      variant: resolveFieldVariant(state),
      done,
      requested: isRequested,
    };
  });
};

export const getUserDisplayName = (request = {}) => {
  const nickname = ensureString(request.userNickname);
  if (nickname) return nickname;

  const email = ensureString(request.userEmail);
  if (email) return email;

  const phone = ensureString(request.userPhone);
  if (phone) return phone;

  return `ID ${ensureString(request.userId) || 'неизвестно'}`;
};

export const getAdminId = (user) => {
  const id = ensureString(user?.id) || ensureString(user?.user_metadata?.id);
  return id || 'UNKNOWN';
};

export const getAdminDisplayName = (user) => {
  const fullName = [ensureString(user?.firstName), ensureString(user?.lastName)]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName) {
    return fullName;
  }

  const nickname = ensureString(user?.nickname);
  if (nickname) {
    return nickname;
  }

  const email = ensureString(user?.email);
  if (email) {
    return email;
  }

  return 'Неизвестный админ';
};

export const getAdminRole = (user) => {
  const role = ensureString(user?.role);
  if (role) return role;

  if (Array.isArray(user?.roles)) {
    const candidate = user.roles
      .map((entry) => ensureString(entry))
      .find((entry) => Boolean(entry));
    if (candidate) {
      return candidate;
    }
  }

  const metadataRole = ensureString(user?.user_metadata?.role) || ensureString(user?.app_metadata?.role);
  if (metadataRole) {
    return metadataRole;
  }

  return 'admin';
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'approved':
      return 'Верифицировано';
    case 'rejected':
      return 'Отказано';
    case 'partial':
      return 'Частично подтверждено';
    default:
      return 'В ожидании проверки';
  }
};

const toFiniteNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const getPendingVerificationVariant = (count) => {
  const numeric = Math.max(0, toFiniteNumber(count));
  if (numeric >= 16) {
    return 'danger';
  }
  if (numeric >= 10) {
    return 'warning';
  }
  return 'success';
};

export const getPendingVerificationTextClass = (count) => {
  const variant = getPendingVerificationVariant(count);
  if (variant === 'danger') {
    return 'text-danger';
  }
  if (variant === 'warning') {
    return 'text-warning';
  }
  return 'text-success';
};
