export const DEFAULT_LOCAL_DB_SCHEMA = Object.freeze({
  version: 1,
  tables: {
    auth_users: { primaryKey: 'id' },
    profiles: { primaryKey: 'id' },
    verification_requests: { primaryKey: 'id' },
    verification_uploads: { primaryKey: 'id' },
    admin_logs: { primaryKey: 'id' },
  },
});
