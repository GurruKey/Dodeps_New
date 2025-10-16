import { getLocalDatabase } from '../../database/engine.js';
import {
  ADMIN_PERMISSIONS_TABLE,
  ADMIN_ROLE_PERMISSIONS_TABLE,
  ADMIN_ROLES_TABLE,
} from './constants.js';

const FALLBACK_TIMESTAMP = '2024-10-10T12:00:00.000Z';

const cloneDeep = (value) => {
  if (value == null) {
    return value;
  }

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // ignore structuredClone failures
    }
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const toTrimmedString = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    const text = String(value).trim();
    return text;
  }

  return '';
};

const toNullableString = (value) => {
  const text = toTrimmedString(value);
  return text || null;
};

const toCamelPermissionKey = (value) => {
  const base = toTrimmedString(value).toLowerCase();
  if (!base) {
    return '';
  }

  return base.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
};

const toNonNegativeSort = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }
  return Math.floor(numeric);
};

const toRoleLevel = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }

  return Math.floor(numeric);
};

const toIsoTimestamp = (value) => {
  if (!value) {
    return FALLBACK_TIMESTAMP;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? FALLBACK_TIMESTAMP : value.toISOString();
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? FALLBACK_TIMESTAMP : date.toISOString();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return FALLBACK_TIMESTAMP;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString();
  }

  return FALLBACK_TIMESTAMP;
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const freezeRecord = (record) => Object.freeze({ ...record });

const freezeRecords = (records = []) => Object.freeze(records.map((record) => freezeRecord(record)));

const FALLBACK_PERMISSIONS = Object.freeze([
  Object.freeze({
    id: 'admin_panel',
    key: 'adminPanel',
    label: 'Админ-панель',
    description: 'Доступ к общей панели администратора.',
    sortOrder: 10,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'overview',
    key: 'overview',
    label: 'Обзор',
    description: 'Просмотр обзорной панели статистики.',
    sortOrder: 20,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'clients',
    key: 'clients',
    label: 'Клиенты',
    description: 'Работа со списком клиентов и их профилями.',
    sortOrder: 30,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'promocodes',
    key: 'promocodes',
    label: 'Promo',
    description: 'Управление промокодами и акциями.',
    sortOrder: 40,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'roles',
    key: 'roles',
    label: 'Выдать роль',
    description: 'Изменение ролей и разрешений сотрудников.',
    sortOrder: 50,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'ranks',
    key: 'ranks',
    label: 'Ранги игроков',
    description: 'Редактирование рангов и наград игроков.',
    sortOrder: 60,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'transactions',
    key: 'transactions',
    label: 'Транзакции',
    description: 'Просмотр и модерация транзакций.',
    sortOrder: 70,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'verification',
    key: 'verification',
    label: 'Верификация',
    description: 'Управление очередью и запросами верификации.',
    sortOrder: 80,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'chat',
    key: 'chat',
    label: 'Модератор Чат',
    description: 'Доступ к административным чатам.',
    sortOrder: 90,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
]);

const FALLBACK_ROLES = Object.freeze([
  Object.freeze({
    id: 'intern-l1',
    roleGroup: 'intern',
    level: 1,
    isAdmin: false,
    name: 'Стажёр 1 lvl',
    description: 'Доступ только к базовому обзору панели под присмотром.',
    sortOrder: 10,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'intern-l2',
    roleGroup: 'intern',
    level: 2,
    isAdmin: false,
    name: 'Стажёр 2 lvl',
    description: 'Видит обзор и может просматривать клиентов без действий.',
    sortOrder: 20,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'moderator-l1',
    roleGroup: 'moderator',
    level: 1,
    isAdmin: false,
    name: 'Модератор 1 lvl',
    description: 'Следит за чатом и базовой верификацией.',
    sortOrder: 30,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'moderator-l2',
    roleGroup: 'moderator',
    level: 2,
    isAdmin: false,
    name: 'Модератор 2 lvl',
    description: 'Контролирует чат и обработку клиентов.',
    sortOrder: 40,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'moderator-l3',
    roleGroup: 'moderator',
    level: 3,
    isAdmin: false,
    name: 'Модератор 3 lvl',
    description: 'Расширенные права модерации, включая транзакции.',
    sortOrder: 50,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'moderator-l4',
    roleGroup: 'moderator',
    level: 4,
    isAdmin: false,
    name: 'Модератор 4 lvl',
    description: 'Полный контроль модерации, включая управление ролями.',
    sortOrder: 60,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'admin-l1',
    roleGroup: 'admin',
    level: 1,
    isAdmin: true,
    name: 'Админ 1 lvl',
    description: 'Начальный уровень администраторов с управлением промокодами.',
    sortOrder: 70,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'admin-l2',
    roleGroup: 'admin',
    level: 2,
    isAdmin: true,
    name: 'Админ 2 lvl',
    description: 'Управление клиентами и промокодами, доступ к транзакциям.',
    sortOrder: 80,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'admin-l3',
    roleGroup: 'admin',
    level: 3,
    isAdmin: true,
    name: 'Админ 3 lvl',
    description: 'Расширенное управление, включая выдачу ролей.',
    sortOrder: 90,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'admin-l4',
    roleGroup: 'admin',
    level: 4,
    isAdmin: true,
    name: 'Админ 4 lvl',
    description: 'Полный административный доступ к панели.',
    sortOrder: 100,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'op',
    roleGroup: 'op',
    level: null,
    isAdmin: true,
    name: 'OP',
    description: 'Операционный директор с максимальными правами по операциям.',
    sortOrder: 110,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
  Object.freeze({
    id: 'owner',
    roleGroup: 'owner',
    level: null,
    isAdmin: true,
    name: 'Owner',
    description: 'Владелец платформы, имеет абсолютный доступ.',
    sortOrder: 120,
    createdAt: FALLBACK_TIMESTAMP,
    updatedAt: FALLBACK_TIMESTAMP,
  }),
]);

const buildFallbackAssignments = (roles, permissions) => {
  const records = [];
  roles.forEach((role) => {
    permissions.forEach((permission, index) => {
      records.push({
        id: `fallback_${role.id}_${permission.id}`,
        roleId: role.id,
        permissionId: permission.id,
        allowed: true,
        createdAt: FALLBACK_TIMESTAMP,
        updatedAt: FALLBACK_TIMESTAMP,
        sortOrder: index + 1,
      });
    });
  });
  return records;
};

const mapRoleRow = (row, index = 0) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toTrimmedString(row.id);
  if (!id) {
    return null;
  }

  const roleGroup = toTrimmedString(row.role_group ?? row.group ?? row.roleGroup).toLowerCase() || 'intern';

  return {
    id,
    roleGroup,
    level: toRoleLevel(row.level ?? row.role_level ?? row.roleLevel),
    isAdmin: Boolean(row.is_admin ?? row.isAdmin ?? false),
    name: toTrimmedString(row.name) || id,
    description: toNullableString(row.description ?? row.details ?? row.summary),
    sortOrder: toNonNegativeSort(row.sort_order ?? row.sortOrder ?? index + 1, index + 1),
    createdAt: toIsoTimestamp(row.created_at ?? row.createdAt),
    updatedAt: toIsoTimestamp(row.updated_at ?? row.updatedAt ?? row.created_at ?? row.createdAt),
  };
};

const mapPermissionRow = (row, index = 0) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = toTrimmedString(row.id ?? row.permission_id ?? row.key ?? row.permissionKey);
  if (!id) {
    return null;
  }

  const key = toCamelPermissionKey(row.key ?? row.permissionKey ?? id);
  if (!key) {
    return null;
  }

  return {
    id,
    key,
    label: toTrimmedString(row.label ?? row.title) || id,
    description: toNullableString(row.description ?? row.summary),
    sortOrder: toNonNegativeSort(row.sort_order ?? row.sortOrder ?? index + 1, index + 1),
    createdAt: toIsoTimestamp(row.created_at ?? row.createdAt),
    updatedAt: toIsoTimestamp(row.updated_at ?? row.updatedAt ?? row.created_at ?? row.createdAt),
  };
};

const mapAssignmentRow = (row, index = 0) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const roleId = toTrimmedString(row.role_id ?? row.roleId ?? row.role);
  const permissionId = toTrimmedString(row.permission_id ?? row.permissionId ?? row.permission);
  if (!roleId || !permissionId) {
    return null;
  }

  return {
    id: toTrimmedString(row.id) || `assignment_${roleId}_${permissionId}_${index + 1}`,
    roleId,
    permissionId,
    allowed:
      row.allowed === undefined && row.is_allowed === undefined && row.value === undefined
        ? true
        : Boolean(row.allowed ?? row.is_allowed ?? row.value),
    sortOrder: toNonNegativeSort(row.sort_order ?? row.sortOrder ?? index + 1, index + 1),
    createdAt: toIsoTimestamp(row.created_at ?? row.createdAt),
    updatedAt: toIsoTimestamp(row.updated_at ?? row.updatedAt ?? row.created_at ?? row.createdAt),
  };
};

const sortByOrderThenId = (a, b) => {
  if (a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder;
  }
  return a.id.localeCompare(b.id);
};

const sortMatrixEntries = (roles, entries) => {
  const orderMap = new Map(roles.map((role, index) => [role.id, index]));
  return entries.sort((a, b) => {
    const orderA = orderMap.get(a.roleId) ?? Number.MAX_SAFE_INTEGER;
    const orderB = orderMap.get(b.roleId) ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.roleName.localeCompare(b.roleName);
  });
};

let datasetCache = null;

const buildAccessSnapshot = () => {
  const db = getLocalDatabase();

  const rawRoles = ensureArray(db.select(ADMIN_ROLES_TABLE));
  let roles = rawRoles.map((row, index) => mapRoleRow(row, index)).filter(Boolean);
  if (!roles.length) {
    roles = FALLBACK_ROLES.map((role) => ({ ...role }));
  }
  roles.sort(sortByOrderThenId);

  const rawPermissions = ensureArray(db.select(ADMIN_PERMISSIONS_TABLE));
  let permissions = rawPermissions.map((row, index) => mapPermissionRow(row, index)).filter(Boolean);
  if (!permissions.length) {
    permissions = FALLBACK_PERMISSIONS.map((permission) => ({ ...permission }));
  }
  permissions.sort(sortByOrderThenId);

  const roleById = new Map(roles.map((role) => [role.id, role]));
  const permissionById = new Map(permissions.map((permission) => [permission.id, permission]));

  const rawAssignments = ensureArray(db.select(ADMIN_ROLE_PERMISSIONS_TABLE));
  let assignments = rawAssignments
    .map((row, index) => mapAssignmentRow(row, index))
    .filter((entry) => entry && roleById.has(entry.roleId) && permissionById.has(entry.permissionId));

  if (!assignments.length) {
    assignments = buildFallbackAssignments(roles, permissions);
  }

  const permissionLegend = permissions.reduce((acc, permission) => {
    acc[permission.key] = permission.label;
    return acc;
  }, {});

  const permissionKeys = permissions.map((permission) => permission.key);

  const matrixByRole = new Map();
  roles.forEach((role) => {
    const basePermissions = permissionKeys.reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});

    matrixByRole.set(role.id, {
      roleId: role.id,
      roleName: role.name,
      permissions: basePermissions,
    });
  });

  assignments.forEach((assignment) => {
    const permission = permissionById.get(assignment.permissionId);
    const target = matrixByRole.get(assignment.roleId);
    if (!permission || !target) {
      return;
    }

    target.permissions[permission.key] = Boolean(assignment.allowed);
  });

  const rolePermissionMatrix = sortMatrixEntries(
    roles,
    Array.from(matrixByRole.values()).map((entry) => ({
      roleId: entry.roleId,
      roleName: entry.roleName,
      permissions: Object.freeze({ ...entry.permissions }),
    })),
  );

  const availableRoles = roles.map((role) =>
    Object.freeze({
      id: role.id,
      group: role.roleGroup,
      level: role.level,
      isAdmin: role.isAdmin,
      name: role.name,
      description: role.description,
    }),
  );

  return Object.freeze({
    roles: freezeRecords(roles),
    permissions: freezeRecords(permissions),
    assignments: freezeRecords(assignments),
    availableRoles: Object.freeze(availableRoles),
    rolePermissionMatrix: Object.freeze(rolePermissionMatrix),
    legend: Object.freeze({ ...permissionLegend }),
  });
};

const ensureDatasetSnapshot = () => {
  if (!datasetCache) {
    datasetCache = buildAccessSnapshot();
  }
  return datasetCache;
};

export const loadAccessDatasetSnapshot = () => ensureDatasetSnapshot();

export const refreshAccessDatasetSnapshot = () => {
  datasetCache = null;
  return ensureDatasetSnapshot();
};

const cloneAvailableRole = (role) => ({
  id: role.id,
  group: role.group,
  level: role.level,
  isAdmin: role.isAdmin,
  name: role.name,
  description: role.description,
});

const cloneMatrixEntry = (entry) => ({
  roleId: entry.roleId,
  roleName: entry.roleName,
  permissions: { ...entry.permissions },
});

export const listAccessAvailableRoles = () => loadAccessDatasetSnapshot().availableRoles.map(cloneAvailableRole);

export const findAccessRoleById = (roleId) => {
  if (typeof roleId !== 'string') {
    return null;
  }

  const normalized = roleId.trim();
  if (!normalized) {
    return null;
  }

  const roles = loadAccessDatasetSnapshot().availableRoles;
  const match = roles.find((role) => role.id === normalized);
  return match ? cloneAvailableRole(match) : null;
};

export const listAccessRolePermissionMatrix = () =>
  loadAccessDatasetSnapshot().rolePermissionMatrix.map(cloneMatrixEntry);

export const getAccessPermissionLegend = () => ({ ...loadAccessDatasetSnapshot().legend });

export const listAccessRoles = () => loadAccessDatasetSnapshot().roles.map((role) => ({ ...role }));

export const listAccessPermissions = () =>
  loadAccessDatasetSnapshot().permissions.map((permission) => ({ ...permission }));

export const listAccessAssignments = () =>
  loadAccessDatasetSnapshot().assignments.map((assignment) => ({ ...assignment }));

export const __internals = Object.freeze({
  cloneDeep,
  toTrimmedString,
  toNullableString,
  toCamelPermissionKey,
  toNonNegativeSort,
  toRoleLevel,
  toIsoTimestamp,
  FALLBACK_ROLES,
  FALLBACK_PERMISSIONS,
  buildFallbackAssignments,
  mapRoleRow,
  mapPermissionRow,
  mapAssignmentRow,
  ensureDatasetSnapshot,
});
