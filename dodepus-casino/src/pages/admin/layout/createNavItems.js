import { ADMIN_NAV_ITEMS } from './meta/navItems.js';

const normalizeRoleId = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed ? trimmed : '';
};

const normalizeRoleGroup = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().toLowerCase();
  return trimmed ? trimmed : '';
};

const collectCandidateRoleIds = (user, roles) => {
  if (!user) return [];

  const candidates = [];
  const pushCandidate = (value) => {
    const normalized = normalizeRoleId(value);
    if (!normalized) return;
    if (!candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };

  pushCandidate(user.roleId);
  pushCandidate(user?.user_metadata?.roleId);
  pushCandidate(user?.app_metadata?.roleId);

  if (Array.isArray(user?.roles)) {
    user.roles.forEach(pushCandidate);
  }

  const groups = new Set();
  [user?.role, user?.user_metadata?.role, user?.app_metadata?.role]
    .map(normalizeRoleGroup)
    .filter(Boolean)
    .forEach((group) => {
      groups.add(group);
    });

  const levels = new Set();
  [
    user?.roleLevel,
    user?.user_metadata?.roleLevel,
    user?.user_metadata?.level,
    user?.app_metadata?.roleLevel,
    user?.app_metadata?.level,
  ].forEach((value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      levels.add(value);
    }
  });

  roles.forEach((role) => {
    if (!role.id || candidates.includes(role.id)) return;
    if (!groups.has(role.group)) return;

    if (role.level !== null && role.level !== undefined) {
      if (levels.has(role.level)) {
        candidates.push(role.id);
      }
      return;
    }

    candidates.push(role.id);
  });

  return candidates;
};

const resolvePermissionsForUser = (user, permissionByRoleId, roles) => {
  if (!user) return null;
  const roleIds = collectCandidateRoleIds(user, roles);

  for (const roleId of roleIds) {
    const permissions = permissionByRoleId.get(roleId);
    if (permissions) {
      return permissions;
    }
  }

  return null;
};

export function createNavItems({ user, availableRoles = [], rolePermissionMatrix = [] }) {
  const permissionByRoleId = rolePermissionMatrix.reduce((acc, role) => {
    if (!role?.roleId) return acc;
    acc.set(role.roleId, role.permissions ?? {});
    return acc;
  }, new Map());

  const normalizedRoles = availableRoles.map((role) => ({
    id: typeof role?.id === 'string' ? role.id.trim() : '',
    group: typeof role?.group === 'string' ? role.group.trim().toLowerCase() : '',
    level:
      typeof role?.level === 'number' && Number.isFinite(role.level) ? role.level : null,
  }));

  const permissions = resolvePermissionsForUser(user, permissionByRoleId, normalizedRoles);

  const filteredItems = ADMIN_NAV_ITEMS.filter((item) => {
    if (item.type === 'divider') {
      return true;
    }

    if (!item.permission) return true;

    if (permissions) {
      return Boolean(permissions[item.permission]);
    }

    if (user?.isAdmin) {
      return true;
    }

    return false;
  });

  const cleanedItems = filteredItems.reduce((acc, item, index) => {
    if (item.type !== 'divider') {
      acc.push(item);
      return acc;
    }

    if (acc.length === 0) {
      return acc;
    }

    const hasNextSection = filteredItems.slice(index + 1).some((candidate) => candidate.type !== 'divider');
    if (!hasNextSection) {
      return acc;
    }

    if (acc[acc.length - 1]?.type === 'divider') {
      return acc;
    }

    acc.push(item);
    return acc;
  }, []);

  if (cleanedItems.length > 0) {
    return cleanedItems;
  }

  return ADMIN_NAV_ITEMS.filter((item) => item.key === 'overview');
}
