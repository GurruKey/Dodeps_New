import AdminRoleGroup from './AdminRoleGroup.jsx';
import InternRoleGroup from './InternRoleGroup.jsx';
import ModeratorRoleGroup from './ModeratorRoleGroup.jsx';
import StaffRoleGroup from './StaffRoleGroup.jsx';

const ROLE_GROUPS = [
  InternRoleGroup,
  ModeratorRoleGroup,
  AdminRoleGroup,
  StaffRoleGroup,
];

const DEFAULT_GROUP_KEY = StaffRoleGroup.metadata.key;

export const roleGroups = ROLE_GROUPS.map((Component) => ({
  ...Component.metadata,
  Component,
}));

export const roleGroupsByKey = roleGroups.reduce((acc, group) => {
  acc[group.key] = group;
  return acc;
}, {});

export const resolveCategoryKey = (group) => {
  if (!group) return DEFAULT_GROUP_KEY;
  return roleGroupsByKey[group]?.key ?? DEFAULT_GROUP_KEY;
};
