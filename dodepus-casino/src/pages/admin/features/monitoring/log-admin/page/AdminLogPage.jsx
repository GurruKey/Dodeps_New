import { useMemo, useState } from 'react';
import { Stack } from 'react-bootstrap';

import { AdminLogFilters, AdminLogTable } from '../blocks/index.js';
import { useAdminLogs } from '../hooks/index.js';

const normalizeSearch = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
};

const withFallbackOption = (options, fallback) => {
  const list = Array.isArray(options) ? options : [];
  return [fallback, ...list];
};

const toSearchString = (value) => normalizeSearch(String(value ?? ''));

export default function AdminLogPage() {
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('all');
  const [role, setRole] = useState('all');

  const { logs, loading, error, sectionOptions, roleOptions } = useAdminLogs();

  const resolvedSectionOptions = useMemo(
    () => withFallbackOption(sectionOptions, { value: 'all', label: 'Все вкладки' }),
    [sectionOptions],
  );

  const resolvedRoleOptions = useMemo(
    () => withFallbackOption(roleOptions, { value: 'all', label: 'Все роли' }),
    [roleOptions],
  );

  const filteredLogs = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    return logs.filter((log) => {
      const matchesId = !normalizedSearch || toSearchString(log.id).includes(normalizedSearch);
      const matchesSection = section === 'all' || log.section === section;
      const matchesRole = role === 'all' || log.role === role;
      return matchesId && matchesSection && matchesRole;
    });
  }, [logs, role, search, section]);

  return (
    <Stack gap={3}>
      <AdminLogFilters
        search={search}
        section={section}
        role={role}
        onSearchChange={setSearch}
        onSectionChange={setSection}
        onRoleChange={setRole}
        sectionOptions={resolvedSectionOptions}
        roleOptions={resolvedRoleOptions}
      />

      <AdminLogTable logs={filteredLogs} loading={loading} error={error} />
    </Stack>
  );
}
