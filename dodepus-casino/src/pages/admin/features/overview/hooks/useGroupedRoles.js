import { useMemo } from 'react';
import { ROLE_COLUMNS } from '../constants/index.js';
import normalizeClients from '../utils/normalizeClients.js';
import createRoleGroups from '../utils/createRoleGroups.js';
import getRoleGroupKey from '../utils/getRoleGroupKey.js';
import getRoleLevel from '../utils/getRoleLevel.js';
import sortRoleEntries from '../utils/sortRoleEntries.js';

export default function useGroupedRoles(clients) {
  const normalizedClients = normalizeClients(clients);

  return useMemo(() => {
    const roleGroups = createRoleGroups(ROLE_COLUMNS);

    normalizedClients.forEach((client) => {
      const groupKey = getRoleGroupKey(client?.role);

      if (!groupKey || !roleGroups[groupKey]) {
        return;
      }

      roleGroups[groupKey].push({
        id: client.id,
        level: getRoleLevel(client?.role),
      });
    });

    return sortRoleEntries(roleGroups, ROLE_COLUMNS);
  }, [normalizedClients]);
}
