import { pickExtras } from './profileExtras';

const resolveAdminFlag = (record, extras) => {
  if (!record) return Boolean(extras?.isAdmin);
  const appRoles = record?.app_metadata?.roles;
  const metadataRole = record?.user_metadata?.role;
  return (
    Boolean(extras?.isAdmin) ||
    (Array.isArray(appRoles) && appRoles.includes('admin')) ||
    metadataRole === 'admin' ||
    Boolean(record?.user_metadata?.isAdmin)
  );
};

export function composeUser(record, extras) {
  if (!record) return null;
  const emailVerified =
    Boolean(record.email_confirmed_at) ||
    Boolean(record.confirmed_at) ||
    Boolean(extras?.emailVerified);

  const roles = Array.isArray(record?.app_metadata?.roles)
    ? record.app_metadata.roles
    : Array.isArray(extras?.roles)
    ? extras.roles
    : [];

  return {
    id: record.id,
    email: record.email ?? '',
    phone: record.phone ?? '',
    createdAt: record.created_at ?? null,
    app_metadata: record.app_metadata ?? {},
    user_metadata: record.user_metadata ?? {},
    roles,
    isAdmin: resolveAdminFlag(record, extras),
    ...pickExtras({ ...extras, emailVerified, email: record.email, phone: record.phone }),
  };
}
