import { getLocalDatabase } from '../../database/engine.js';

const normalizeText = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  return '';
};

const normalizeOptionalText = (value) => {
  const text = normalizeText(value);
  return text || null;
};

const normalizeSortOrder = (value, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return numeric;
};

const normalizeRoleLevel = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }
  return Math.floor(numeric);
};

const toCamelPermissionKey = (value) => {
  const base = normalizeText(value).toLowerCase();
  if (!base) {
    return '';
  }
  return base.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
};

const FALLBACK_PERMISSIONS = Object.freeze([
  Object.freeze({ id: 'admin_panel', key: 'adminPanel', label: 'Админ-панель', sortOrder: 10 }),
  Object.freeze({ id: 'overview', key: 'overview', label: 'Обзор', sortOrder: 20 }),
  Object.freeze({ id: 'clients', key: 'clients', label: 'Клиенты', sortOrder: 30 }),
  Object.freeze({ id: 'promocodes', key: 'promocodes', label: 'Promo', sortOrder: 40 }),
  Object.freeze({ id: 'roles', key: 'roles', label: 'Выдать роль', sortOrder: 50 }),
  Object.freeze({ id: 'ranks', key: 'ranks', label: 'Ранги игроков', sortOrder: 60 }),
  Object.freeze({ id: 'transactions', key: 'transactions', label: 'Транзакции', sortOrder: 70 }),
  Object.freeze({ id: 'verification', key: 'verification', label: 'Верификация', sortOrder: 80 }),
  Object.freeze({ id: 'chat', key: 'chat', label: 'Модератор Чат', sortOrder: 90 }),
]);

const FALLBACK_ROLES = Object.freeze([
  Object.freeze({
    id: 'intern-l1',
    group: 'intern',
    level: 1,
    isAdmin: false,
    name: 'Стажёр 1 lvl',
    description: 'Доступ только к базовому обзору панели под присмотром.',
    sortOrder: 10,
  }),
  Object.freeze({
    id: 'intern-l2',
    group: 'intern',
    level: 2,
    isAdmin: false,
    name: 'Стажёр 2 lvl',
    description: 'Видит обзор и может просматривать клиентов без действий.',
    sortOrder: 20,
  }),
  Object.freeze({
    id: 'moderator-l1',
    group: 'moderator',
    level: 1,
    isAdmin: false,
    name: 'Модератор 1 lvl',
    description: 'Следит за чатом и базовой верификацией.',
    sortOrder: 30,
  }),
  Object.freeze({
    id: 'moderator-l2',
    group: 'moderator',
    level: 2,
    isAdmin: false,
    name: 'Модератор 2 lvl',
    description: 'Контролирует чат и обработку клиентов.',
    sortOrder: 40,
  }),
  Object.freeze({
    id: 'moderator-l3',
    group: 'moderator',
    level: 3,
    isAdmin: false,
    name: 'Модератор 3 lvl',
    description: 'Расширенные права модерации, включая транзакции.',
    sortOrder: 50,
  }),
  Object.freeze({
    id: 'moderator-l4',
    group: 'moderator',
    level: 4,
    isAdmin: false,
    name: 'Модератор 4 lvl',
    description: 'Полный контроль модерации, включая управление ролями.',
    sortOrder: 60,
  }),
  Object.freeze({
    id: 'admin-l1',
    group: 'admin',
    level: 1,
    isAdmin: true,
    name: 'Админ 1 lvl',
    description: 'Начальный уровень администраторов с управлением промокодами.',
    sortOrder: 70,
  }),
  Object.freeze({
    id: 'admin-l2',
    group: 'admin',
    level: 2,
    isAdmin: true,
    name: 'Админ 2 lvl',
    description: 'Управление клиентами и промокодами, доступ к транзакциям.',
    sortOrder: 80,
  }),
  Object.freeze({
    id: 'admin-l3',
    group: 'admin',
    level: 3,
    isAdmin: true,
    name: 'Админ 3 lvl',
    description: 'Расширенное управление, включая выдачу ролей.',
    sortOrder: 90,
  }),
  Object.freeze({
    id: 'admin-l4',
    group: 'admin',
    level: 4,
    isAdmin: true,
    name: 'Админ 4 lvl',
    description: 'Полный административный доступ к панели.',
    sortOrder: 100,
  }),
  Object.freeze({
    id: 'op',
    group: 'op',
    level: null,
    isAdmin: true,
    name: 'OP',
    description: 'Операционный директор с максимальными правами по операциям.',
    sortOrder: 110,
  }),
  Object.freeze({
    id: 'owner',
    group: 'owner',
    level: null,
    isAdmin: true,
    name: 'Owner',
    description: 'Владелец платформы, имеет абсолютный доступ.',
    sortOrder: 120,
  }),
]);

let accessCache = null;

const normalizeRoleRecord = (row, index = 0) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = normalizeText(row.id);
  if (!id) {
    return null;
  }

  const group = normalizeText(row.role_group ?? row.group ?? row.roleGroup ?? '').toLowerCase() || 'intern';
  const level = normalizeRoleLevel(row.level ?? row.role_level ?? row.roleLevel ?? null);
  const isAdmin = Boolean(row.is_admin ?? row.isAdmin ?? false);
  const name = normalizeText(row.name ?? '') || id;
  const description = normalizeOptionalText(row.description ?? row.details ?? row.summary ?? null);
  const sortOrder = normalizeSortOrder(row.sort_order ?? row.order ?? index + 1, index + 1);

  return {
    id,
    group,
    level,
    isAdmin,
    name,
    description,
    sortOrder,
  };
};

const normalizePermissionRecord = (row, index = 0) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = normalizeText(row.id ?? row.permission_id ?? row.key ?? row.permissionKey);
  if (!id) {
    return null;
  }

  const key = toCamelPermissionKey(id);
  if (!key) {
    return null;
  }

  const label = normalizeText(row.label ?? row.title ?? '') || id;
  const description = normalizeOptionalText(row.description ?? row.summary ?? null);
  const sortOrder = normalizeSortOrder(row.sort_order ?? row.order ?? index + 1, index + 1);

  return {
    id,
    key,
    label,
    description,
    sortOrder,
  };
};

const normalizeRolePermissionRecord = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const roleId = normalizeText(row.role_id ?? row.roleId ?? row.role);
  const permissionId = normalizeText(row.permission_id ?? row.permissionId ?? row.permission_key ?? row.permissionKey);

  if (!roleId || !permissionId) {
    return null;
  }

  const allowed =
    row.allowed === undefined && row.is_allowed === undefined && row.value === undefined
      ? true
      : Boolean(row.allowed ?? row.is_allowed ?? row.value);

  return {
    roleId,
    permissionId,
    allowed,
  };
};

const cloneRole = (role) => ({
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

const buildFallbackLegend = () =>
  FALLBACK_PERMISSIONS.reduce((acc, permission) => {
    acc[permission.key] = permission.label;
    return acc;
  }, {});

const buildFallbackMatrix = () =>
  FALLBACK_ROLES.map((role) => ({
    roleId: role.id,
    roleName: role.name,
    permissions: FALLBACK_PERMISSIONS.reduce((acc, permission) => {
      acc[permission.key] = true;
      return acc;
    }, {}),
  }));

const ensureAccessCache = () => {
  if (accessCache) {
    return accessCache;
  }

  const db = getLocalDatabase();

  const rawRoles = db.select('admin_roles') ?? [];
  const normalizedRoles = rawRoles
    .map((row, index) => normalizeRoleRecord(row, index))
    .filter(Boolean);
  const roles = (normalizedRoles.length ? normalizedRoles : FALLBACK_ROLES.map((role) => ({ ...role }))).sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  const rawPermissions = db.select('admin_permissions') ?? [];
  const normalizedPermissions = rawPermissions
    .map((row, index) => normalizePermissionRecord(row, index))
    .filter(Boolean);
  const permissions = (normalizedPermissions.length
    ? normalizedPermissions
    : FALLBACK_PERMISSIONS.map((permission) => ({ ...permission }))
  ).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const permissionById = new Map(permissions.map((permission) => [permission.id, permission]));
  const permissionKeys = permissions.map((permission) => permission.key);

  const legend = permissions.reduce((acc, permission) => {
    acc[permission.key] = permission.label;
    return acc;
  }, {});

  const rawRolePermissions = db.select('admin_role_permissions') ?? [];
  const normalizedRolePermissions = rawRolePermissions
    .map((row) => normalizeRolePermissionRecord(row))
    .filter(Boolean)
    .filter((entry) => permissionById.has(entry.permissionId));

  const rolePermissionMap = new Map();
  roles.forEach((role) => {
    const basePermissions = permissionKeys.reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});

    rolePermissionMap.set(role.id, {
      roleId: role.id,
      roleName: role.name,
      permissions: basePermissions,
    });
  });

  if (normalizedRolePermissions.length) {
    normalizedRolePermissions.forEach((entry) => {
      const permission = permissionById.get(entry.permissionId);
      const target = rolePermissionMap.get(entry.roleId);
      if (!permission || !target) {
        return;
      }
      target.permissions[permission.key] = Boolean(entry.allowed);
    });
  } else {
    rolePermissionMap.forEach((entry) => {
      permissionKeys.forEach((key) => {
        entry.permissions[key] = true;
      });
    });
  }

  const roleOrderMap = new Map(roles.map((role) => [role.id, role.sortOrder ?? 0]));

  const rolePermissionMatrix = Array.from(rolePermissionMap.values())
    .map((entry) => ({
      roleId: entry.roleId,
      roleName: entry.roleName,
      permissions: Object.freeze({ ...entry.permissions }),
    }))
    .sort((a, b) => (roleOrderMap.get(a.roleId) ?? 0) - (roleOrderMap.get(b.roleId) ?? 0));

  const availableRoles = roles.map((role) =>
    Object.freeze({
      id: role.id,
      group: role.group,
      level: role.level,
      isAdmin: role.isAdmin,
      name: role.name,
      description: role.description,
    }),
  );

  accessCache = Object.freeze({
    availableRoles: Object.freeze(availableRoles),
    legend: Object.freeze({ ...legend }),
    rolePermissionMatrix: Object.freeze(rolePermissionMatrix),
  });

  return accessCache;
};

export const availableRoles = ensureAccessCache().availableRoles;
export const roleMatrixLegend = ensureAccessCache().legend;
export const rolePermissionMatrix = ensureAccessCache().rolePermissionMatrix;

export const listAvailableAdminRoles = () => ensureAccessCache().availableRoles.map(cloneRole);

export const findAdminRoleById = (roleId) => {
  if (typeof roleId !== 'string') {
    return null;
  }
  const normalized = roleId.trim();
  if (!normalized) {
    return null;
  }

  const roles = ensureAccessCache().availableRoles;
  const match = roles.find((role) => role.id === normalized);
  return match ? cloneRole(match) : null;
};

export const listRolePermissionMatrix = () => ensureAccessCache().rolePermissionMatrix.map(cloneMatrixEntry);

export const getRolePermissionLegend = () => ({ ...ensureAccessCache().legend });

export const __internals = Object.freeze({
  ensureAccessCache,
  refreshCache: () => {
    accessCache = null;
    return ensureAccessCache();
  },
  FALLBACK_ROLES,
  FALLBACK_PERMISSIONS,
  buildFallbackLegend,
  buildFallbackMatrix,
});
