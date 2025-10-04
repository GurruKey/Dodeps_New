const ADMIN_LOG_SECTIONS = Object.freeze([
  { value: 'overview', label: 'Обзор' },
  { value: 'clients', label: 'Клиенты' },
  { value: 'promocodes', label: 'Промокоды' },
  { value: 'roles', label: 'Выдать роль' },
  { value: 'role-edit', label: 'Изменить роль' },
  { value: 'transactions', label: 'Транзакции' },
  { value: 'verification', label: 'Верификация' },
  { value: 'moderators-chat', label: 'Чат модераторов' },
  { value: 'administrators-chat', label: 'Админ Чат' },
  { value: 'log-admin', label: 'Log Admin' },
]);

const ADMIN_LOG_ROLE_LABELS = Object.freeze({
  superadmin: 'Суперадмин',
  manager: 'Менеджер',
  moderator: 'Модератор',
  analyst: 'Аналитик',
  operator: 'Оператор',
});

const ADMIN_LOGS = [
  {
    id: 'LOG-2024-0001',
    adminId: 'ADM-001',
    adminName: 'Ольга Смирнова',
    role: 'superadmin',
    section: 'roles',
    action: 'Назначила новые разрешения пользователю #1024',
    createdAt: '2024-04-15T09:12:00.000Z',
  },
  {
    id: 'LOG-2024-0002',
    adminId: 'ADM-002',
    adminName: 'Иван Ковалёв',
    role: 'manager',
    section: 'clients',
    action: 'Обновил контактные данные клиента #2048',
    createdAt: '2024-04-15T10:05:00.000Z',
  },
  {
    id: 'LOG-2024-0003',
    adminId: 'ADM-003',
    adminName: 'Мария Лебедева',
    role: 'analyst',
    section: 'overview',
    action: 'Экспортировала отчёт по вовлечённости за неделю',
    createdAt: '2024-04-15T10:17:00.000Z',
  },
  {
    id: 'LOG-2024-0004',
    adminId: 'ADM-001',
    adminName: 'Ольга Смирнова',
    role: 'superadmin',
    section: 'role-edit',
    action: 'Отозвала привилегии модератора у пользователя #3055',
    createdAt: '2024-04-15T10:42:00.000Z',
  },
  {
    id: 'LOG-2024-0005',
    adminId: 'ADM-004',
    adminName: 'Сергей Журавлёв',
    role: 'moderator',
    section: 'moderators-chat',
    action: 'Закрепил новое сообщение с регламентом',
    createdAt: '2024-04-15T11:02:00.000Z',
  },
  {
    id: 'LOG-2024-0006',
    adminId: 'ADM-002',
    adminName: 'Иван Ковалёв',
    role: 'manager',
    section: 'transactions',
    action: 'Одобрил вывод средств #784321',
    createdAt: '2024-04-15T11:35:00.000Z',
  },
  {
    id: 'LOG-2024-0007',
    adminId: 'ADM-005',
    adminName: 'Анна Фролова',
    role: 'operator',
    section: 'verification',
    action: 'Подтвердила документы клиента #5077',
    createdAt: '2024-04-15T11:54:00.000Z',
  },
  {
    id: 'LOG-2024-0008',
    adminId: 'ADM-004',
    adminName: 'Сергей Журавлёв',
    role: 'moderator',
    section: 'administrators-chat',
    action: 'Ответил на запрос службы безопасности',
    createdAt: '2024-04-15T12:08:00.000Z',
  },
  {
    id: 'LOG-2024-0009',
    adminId: 'ADM-003',
    adminName: 'Мария Лебедева',
    role: 'analyst',
    section: 'promocodes',
    action: 'Проанализировала эффективность промокода WELCOME-50',
    createdAt: '2024-04-15T12:25:00.000Z',
  },
  {
    id: 'LOG-2024-0010',
    adminId: 'ADM-002',
    adminName: 'Иван Ковалёв',
    role: 'manager',
    section: 'clients',
    action: 'Заморозил аккаунт клиента #6882 по запросу службы безопасности',
    createdAt: '2024-04-15T12:47:00.000Z',
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const createAbortError = (reason) => {
  if (reason instanceof Error) return reason;
  if (typeof DOMException === 'function') {
    return new DOMException('Aborted', 'AbortError');
  }
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
};

export const getAdminLogSections = () => ADMIN_LOG_SECTIONS.map(clone);

export const getAdminLogRoleOptions = () =>
  Object.entries(ADMIN_LOG_ROLE_LABELS).map(([value, label]) => ({ value, label }));

export const getAdminLogRoleLabel = (role) => ADMIN_LOG_ROLE_LABELS[role] ?? role;

export const getAdminLogSectionLabel = (section) => {
  const found = ADMIN_LOG_SECTIONS.find((option) => option.value === section);
  return found ? found.label : section;
};

export const readAdminLogs = () => ADMIN_LOGS.map(clone);

export function listAdminLogs({ signal, delay = 200 } = {}) {
  if (signal?.aborted) {
    return Promise.reject(createAbortError(signal.reason));
  }

  return new Promise((resolve, reject) => {
    const timeout = Math.max(0, delay);

    const complete = () => {
      try {
        resolve(readAdminLogs());
      } catch (error) {
        reject(error);
      }
    };

    if (!timeout) {
      complete();
      return;
    }

    const timer = setTimeout(() => {
      complete();
    }, timeout);

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(createAbortError(signal.reason));
        },
        { once: true },
      );
    }
  });
}

export const __internals = Object.freeze({
  ADMIN_LOGS,
  ADMIN_LOG_SECTIONS,
  ADMIN_LOG_ROLE_LABELS,
});

