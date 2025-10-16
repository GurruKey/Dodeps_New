export const DEFAULT_LOCAL_DB_SCHEMA = Object.freeze({
  version: 1,
  tables: {
    auth_users: { primaryKey: 'id' },
    profiles: { primaryKey: 'id' },
    admin_roles: { primaryKey: 'id' },
    admin_permissions: { primaryKey: 'id' },
    admin_role_permissions: { primaryKey: 'id' },
    admin_promocodes: { primaryKey: 'id' },
    profile_transactions: { primaryKey: 'id' },
    verification_requests: { primaryKey: 'id' },
    verification_uploads: { primaryKey: 'id' },
    verification_queue: { primaryKey: 'id' },
    admin_logs: { primaryKey: 'id' },
    communication_threads: { primaryKey: 'id' },
    communication_thread_participants: { primaryKey: 'id' },
    communication_messages: { primaryKey: 'id' },
  },
});
