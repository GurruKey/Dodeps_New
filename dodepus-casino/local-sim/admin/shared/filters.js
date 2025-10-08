const defaultStatusLabel = (status) => status;

export function getStatusOptions({
  clients = [],
  includeAll = true,
  allLabel = 'all',
  formatLabel = defaultStatusLabel,
} = {}) {
  const labelFor = typeof formatLabel === 'function' ? formatLabel : defaultStatusLabel;

  const statuses = Array.from(
    clients.reduce((acc, client) => {
      if (!client?.status) return acc;
      return acc.add(client.status);
    }, new Set()),
  ).sort((a, b) => a.localeCompare(b));

  const options = statuses.map((status) => ({
    value: status,
    label: labelFor(status),
  }));

  if (includeAll) {
    options.unshift({ value: 'all', label: allLabel });
  }

  return options;
}

const defaultRoleLabel = (role) =>
  role.level != null ? `${role.group} lvl ${role.level}` : role.group;

const normalizeRole = (role = {}) => ({
  group: role.group,
  level: typeof role.level === 'number' ? role.level : undefined,
});

const createRoleValue = (role) =>
  role.level != null ? `${role.group}:${role.level}` : role.group;

export function getRoleOptions({
  clients = [],
  includeAll = true,
  allLabel = 'all',
  formatLabel = defaultRoleLabel,
} = {}) {
  const labelFor = typeof formatLabel === 'function' ? formatLabel : defaultRoleLabel;

  const uniqueRoles = new Map();

  clients.forEach((client) => {
    if (!client?.role?.group) return;

    const role = normalizeRole(client.role);
    const value = createRoleValue(role);

    if (!uniqueRoles.has(value)) {
      uniqueRoles.set(value, role);
    }
  });

  const sortedRoles = Array.from(uniqueRoles.entries()).sort(([, roleA], [, roleB]) => {
    if (roleA.group === roleB.group) {
      const levelA = roleA.level ?? -Infinity;
      const levelB = roleB.level ?? -Infinity;
      return levelA - levelB;
    }

    return roleA.group.localeCompare(roleB.group);
  });

  const options = sortedRoles.map(([value, role]) => ({
    value,
    label: labelFor(role, value),
  }));

  if (includeAll) {
    options.unshift({ value: 'all', label: allLabel });
  }

  return options;
}
