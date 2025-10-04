import { availableRoles } from '../../../src/pages/Admin/roles/data/roleConfigs.js';

const STORAGE_KEY = 'dodepus_admin_panel_visibility_v1';
export const ADMIN_PANEL_VISIBILITY_EVENT = 'dodepus:admin-panel-visibility-change';

const getEventTarget = () => {
  if (typeof window !== 'undefined') return window;
  if (typeof globalThis !== 'undefined' && globalThis?.addEventListener) {
    return globalThis;
  }
  return null;
};

const emitVisibilityChange = (visibility) => {
  const target = getEventTarget();
  if (!target?.dispatchEvent || typeof CustomEvent !== 'function') return;

  try {
    const detail = { visibility: normalizeVisibilityMap(visibility) };
    target.dispatchEvent(new CustomEvent(ADMIN_PANEL_VISIBILITY_EVENT, { detail }));
  } catch (error) {
    console.warn('Не удалось оповестить об изменении доступа к админ-панели', error);
  }
};

const getStorage = () => {
  try {
    if (typeof globalThis === 'undefined') return null;
    return globalThis.localStorage ?? null;
  } catch (error) {
    console.warn('Локальное хранилище недоступно для настроек админ-панели', error);
    return null;
  }
};

const buildDefaultVisibility = () => {
  const defaults = {};
  availableRoles.forEach((role) => {
    defaults[role.id] = Boolean(role.isAdmin);
  });
  return defaults;
};

const normalizeVisibilityMap = (value) => {
  const defaults = buildDefaultVisibility();
  const normalized = { ...defaults };
  if (!value || typeof value !== 'object') return normalized;

  Object.entries(value).forEach(([roleId, flag]) => {
    if (!Object.prototype.hasOwnProperty.call(defaults, roleId)) return;
    normalized[roleId] = Boolean(flag);
  });

  return normalized;
};

export const loadAdminPanelVisibility = (storage = getStorage()) => {
  const defaults = buildDefaultVisibility();
  if (!storage) return defaults;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return normalizeVisibilityMap(parsed);
  } catch (error) {
    console.warn('Не удалось загрузить настройки админ-панели, используются значения по умолчанию', error);
    return defaults;
  }
};

export const saveAdminPanelVisibility = (visibility, storage = getStorage()) => {
  if (!storage) return;
  try {
    const normalized = normalizeVisibilityMap(visibility);
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    emitVisibilityChange(normalized);
  } catch (error) {
    console.warn('Не удалось сохранить настройки админ-панели', error);
  }
};

export const setAdminPanelVisibilityForRole = (roleId, canSee, storage = getStorage()) => {
  if (!roleId) return loadAdminPanelVisibility(storage);
  const visibility = loadAdminPanelVisibility(storage);
  if (!Object.prototype.hasOwnProperty.call(visibility, roleId)) {
    return visibility;
  }
  const nextVisibility = {
    ...visibility,
    [roleId]: Boolean(canSee),
  };
  saveAdminPanelVisibility(nextVisibility, storage);
  return nextVisibility;
};

export const toggleAdminPanelVisibilityForRole = (roleId, storage = getStorage()) => {
  const visibility = loadAdminPanelVisibility(storage);
  if (!roleId || !Object.prototype.hasOwnProperty.call(visibility, roleId)) {
    return visibility;
  }
  const nextVisibility = {
    ...visibility,
    [roleId]: !visibility[roleId],
  };
  saveAdminPanelVisibility(nextVisibility, storage);
  return nextVisibility;
};

export const resetAdminPanelVisibility = (storage = getStorage()) => {
  const defaults = buildDefaultVisibility();
  saveAdminPanelVisibility(defaults, storage);
  return defaults;
};

const normalizeRoleId = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed ? trimmed : '';
};

const collectCandidateRoleIds = (user) => {
  if (!user) return [];

  const candidates = new Set();
  const pushId = (id) => {
    const normalized = normalizeRoleId(id);
    if (normalized) candidates.add(normalized);
  };

  pushId(user.roleId);
  pushId(user?.user_metadata?.roleId);
  pushId(user?.app_metadata?.roleId);

  if (Array.isArray(user?.roles)) {
    user.roles.forEach(pushId);
  }

  const collectGroup = (record) => {
    if (typeof record !== 'string') return null;
    const trimmed = record.trim();
    return trimmed ? trimmed : null;
  };

  const groups = new Set();
  [user?.role, user?.user_metadata?.role, user?.app_metadata?.role].forEach((value) => {
    const group = collectGroup(value);
    if (group) groups.add(group);
  });

  const levels = new Set();
  const pushLevel = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      levels.add(value);
    }
  };

  pushLevel(user?.roleLevel);
  pushLevel(user?.user_metadata?.roleLevel);
  pushLevel(user?.user_metadata?.level);
  pushLevel(user?.app_metadata?.roleLevel);
  pushLevel(user?.app_metadata?.level);

  availableRoles.forEach((role) => {
    if (!role?.id) return;
    if (candidates.has(role.id)) return;
    if (!groups.has(role.group)) return;

    if (typeof role.level === 'number') {
      if (levels.has(role.level)) {
        candidates.add(role.id);
      }
      return;
    }

    // Для ролей без уровня добавляем при совпадении группы.
    candidates.add(role.id);
  });

  return Array.from(candidates);
};

export const canUserAccessAdminPanel = (user, storage = getStorage()) => {
  if (!user) return false;
  const visibility = loadAdminPanelVisibility(storage);
  const roleIds = collectCandidateRoleIds(user);

  let hasDefinedSetting = false;
  let allow = false;

  roleIds.forEach((roleId) => {
    if (!Object.prototype.hasOwnProperty.call(visibility, roleId)) return;
    hasDefinedSetting = true;
    if (visibility[roleId]) {
      allow = true;
    }
  });

  if (hasDefinedSetting) {
    return allow;
  }

  return Boolean(user.isAdmin);
};

export const getRoleAdminPanelVisibility = (roleId, storage = getStorage()) => {
  const visibility = loadAdminPanelVisibility(storage);
  if (!roleId) return undefined;
  if (!Object.prototype.hasOwnProperty.call(visibility, roleId)) return undefined;
  return Boolean(visibility[roleId]);
};

