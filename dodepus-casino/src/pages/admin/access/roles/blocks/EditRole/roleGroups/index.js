import AdminRoleGroup, { metadata as adminMetadata } from './AdminRoleGroup.jsx';
import InternRoleGroup, { metadata as internMetadata } from './InternRoleGroup.jsx';
import ModeratorRoleGroup, { metadata as moderatorMetadata } from './ModeratorRoleGroup.jsx';
import StaffRoleGroup, { metadata as staffMetadata } from './StaffRoleGroup.jsx';

export const roleGroups = [
  { ...internMetadata, Component: InternRoleGroup },
  { ...moderatorMetadata, Component: ModeratorRoleGroup },
  { ...adminMetadata, Component: AdminRoleGroup },
  { ...staffMetadata, Component: StaffRoleGroup },
];

export const roleGroupsByKey = roleGroups.reduce((acc, group) => {
  acc[group.key] = group;
  return acc;
}, {});

export const resolveCategoryKey = (group) => {
  if (group === 'intern') return internMetadata.key;
  if (group === 'moderator') return moderatorMetadata.key;
  if (group === 'admin') return adminMetadata.key;
  return staffMetadata.key;
};
