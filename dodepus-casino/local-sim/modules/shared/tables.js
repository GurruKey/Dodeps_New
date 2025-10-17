export const TABLES = Object.freeze({
  authUsers: 'auth_users',
  profiles: 'profiles',
  adminRoles: 'admin_roles',
  adminPermissions: 'admin_permissions',
  adminRolePermissions: 'admin_role_permissions',
  adminPromocodes: 'admin_promocodes',
  adminLogs: 'admin_logs',
  profileTransactions: 'profile_transactions',
  rankLevels: 'rank_levels',
  rankRewards: 'rank_rewards',
  verificationRequests: 'verification_requests',
  verificationUploads: 'verification_uploads',
  verificationQueue: 'verification_queue',
  communicationThreads: 'communication_threads',
  communicationThreadParticipants: 'communication_thread_participants',
  communicationMessages: 'communication_messages',
});

export const TABLE_PRIMARY_KEYS = Object.freeze({
  [TABLES.authUsers]: 'id',
  [TABLES.profiles]: 'id',
  [TABLES.adminRoles]: 'id',
  [TABLES.adminPermissions]: 'id',
  [TABLES.adminRolePermissions]: 'id',
  [TABLES.adminPromocodes]: 'id',
  [TABLES.adminLogs]: 'id',
  [TABLES.profileTransactions]: 'id',
  [TABLES.rankLevels]: 'id',
  [TABLES.rankRewards]: 'id',
  [TABLES.verificationRequests]: 'id',
  [TABLES.verificationUploads]: 'id',
  [TABLES.verificationQueue]: 'id',
  [TABLES.communicationThreads]: 'id',
  [TABLES.communicationThreadParticipants]: 'id',
  [TABLES.communicationMessages]: 'id',
});

export const TABLE_LIST = Object.freeze(Object.values(TABLES));

export const AUTH_USERS_TABLE = TABLES.authUsers;
export const PROFILES_TABLE = TABLES.profiles;
export const ADMIN_ROLES_TABLE = TABLES.adminRoles;
export const ADMIN_PERMISSIONS_TABLE = TABLES.adminPermissions;
export const ADMIN_ROLE_PERMISSIONS_TABLE = TABLES.adminRolePermissions;
export const ADMIN_PROMOCODES_TABLE = TABLES.adminPromocodes;
export const ADMIN_LOGS_TABLE = TABLES.adminLogs;
export const PROFILE_TRANSACTIONS_TABLE = TABLES.profileTransactions;
export const RANK_LEVELS_TABLE = TABLES.rankLevels;
export const RANK_REWARDS_TABLE = TABLES.rankRewards;
export const VERIFICATION_REQUESTS_TABLE = TABLES.verificationRequests;
export const VERIFICATION_UPLOADS_TABLE = TABLES.verificationUploads;
export const VERIFICATION_QUEUE_TABLE = TABLES.verificationQueue;
export const COMMUNICATION_THREADS_TABLE = TABLES.communicationThreads;
export const COMMUNICATION_THREAD_PARTICIPANTS_TABLE = TABLES.communicationThreadParticipants;
export const COMMUNICATION_MESSAGES_TABLE = TABLES.communicationMessages;
