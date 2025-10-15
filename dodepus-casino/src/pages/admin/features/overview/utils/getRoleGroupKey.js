export default function getRoleGroupKey(role) {
  if (!role || typeof role.group !== 'string') {
    return '';
  }

  return role.group.trim().toLowerCase();
}
