import {
  findAccessRoleById,
  getAccessPermissionLegend,
  listAccessAvailableRoles,
  listAccessRolePermissionMatrix,
  loadAccessDatasetSnapshot,
  refreshAccessDatasetSnapshot,
  __accessSnapshotInternals as datasetInternals,
} from '../storage/index.js';

const snapshot = loadAccessDatasetSnapshot();

export const availableRoles = snapshot.availableRoles;
export const roleMatrixLegend = snapshot.legend;
export const rolePermissionMatrix = snapshot.rolePermissionMatrix;

export const listAvailableAdminRoles = () => listAccessAvailableRoles();

export const findAdminRoleById = (roleId) => findAccessRoleById(roleId);

export const listRolePermissionMatrix = () => listAccessRolePermissionMatrix();

export const getRolePermissionLegend = () => getAccessPermissionLegend();

const buildFallbackLegend = () =>
  datasetInternals.FALLBACK_PERMISSIONS.reduce((acc, permission) => {
    acc[permission.key] = permission.label;
    return acc;
  }, {});

const buildFallbackMatrix = () =>
  datasetInternals.FALLBACK_ROLES.map((role) => ({
    roleId: role.id,
    roleName: role.name,
    permissions: datasetInternals.FALLBACK_PERMISSIONS.reduce((acc, permission) => {
      acc[permission.key] = true;
      return acc;
    }, {}),
  }));

export const __internals = Object.freeze({
  ensureAccessCache: () => loadAccessDatasetSnapshot(),
  refreshCache: () => refreshAccessDatasetSnapshot(),
  FALLBACK_ROLES: datasetInternals.FALLBACK_ROLES,
  FALLBACK_PERMISSIONS: datasetInternals.FALLBACK_PERMISSIONS,
  buildFallbackLegend,
  buildFallbackMatrix,
});
