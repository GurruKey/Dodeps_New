#!/usr/bin/env node
import authUsers from '../db/auth_users.json' with { type: 'json' };
import profiles from '../db/profiles.json' with { type: 'json' };
import adminRoles from '../db/admin_roles.json' with { type: 'json' };
import adminPermissions from '../db/admin_permissions.json' with { type: 'json' };
import adminRolePermissions from '../db/admin_role_permissions.json' with { type: 'json' };
import adminPromocodes from '../db/admin_promocodes.json' with { type: 'json' };
import adminLogs from '../db/admin_logs.json' with { type: 'json' };
import profileTransactions from '../db/profile_transactions.json' with { type: 'json' };
import rankLevels from '../db/rank_levels.json' with { type: 'json' };
import rankRewards from '../db/rank_rewards.json' with { type: 'json' };
import verificationRequests from '../db/verification_requests.json' with { type: 'json' };
import verificationUploads from '../db/verification_uploads.json' with { type: 'json' };
import verificationQueue from '../db/verification_queue.json' with { type: 'json' };
import communicationThreads from '../db/communication_threads.json' with { type: 'json' };
import communicationThreadParticipants from '../db/communication_thread_participants.json' with { type: 'json' };
import communicationMessages from '../db/communication_messages.json' with { type: 'json' };

const errors = [];

const toArray = (value) => (Array.isArray(value) ? value : []);

const pushError = (message) => {
  errors.push(message);
};

const assertArray = (value, label) => {
  if (!Array.isArray(value)) {
    pushError(`${label}: expected array, received ${typeof value}`);
    return [];
  }
  return value;
};

const ensureUnique = (items, key, label) => {
  const seen = new Map();
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      pushError(`${label}: encountered non-object entry`);
      continue;
    }
    const value = item[key];
    if (typeof value !== 'string' && typeof value !== 'number') {
      pushError(`${label}: missing ${key} value`);
      continue;
    }
    const normalized = String(value);
    if (seen.has(normalized)) {
      pushError(`${label}: duplicate ${key} "${normalized}" (also used in ${seen.get(normalized)})`);
    } else {
      seen.set(normalized, JSON.stringify(item));
    }
  }
  return seen;
};

const ensureReference = ({
  items,
  fromKey,
  toMap,
  toLabel,
  label,
  allowNull = false,
}) => {
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const value = item[fromKey];
    if (value == null || value === '') {
      if (!allowNull) {
        pushError(`${label}: ${fromKey} is empty for entry ${JSON.stringify(item)}`);
      }
      continue;
    }
    const normalized = String(value);
    if (!toMap.has(normalized)) {
      pushError(`${label}: ${fromKey} "${normalized}" does not exist in ${toLabel}`);
    }
  }
};

const ensureNonEmptyString = ({ items, key, label }) => {
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const value = item[key];
    if (typeof value !== 'string' || !value.trim()) {
      pushError(`${label}: ${key} is empty for entry ${JSON.stringify(item)}`);
    }
  }
};

const registerDataset = (raw, label, key = 'id') => {
  const array = assertArray(toArray(raw), label);
  const index = ensureUnique(array, key, label);
  return { rows: array, index };
};

const authDataset = registerDataset(authUsers, 'auth_users');
const profileDataset = registerDataset(profiles, 'profiles');
const rolesDataset = registerDataset(adminRoles, 'admin_roles');
const permissionsDataset = registerDataset(adminPermissions, 'admin_permissions');
const rolePermissionsDataset = registerDataset(adminRolePermissions, 'admin_role_permissions');
const promocodeDataset = registerDataset(adminPromocodes, 'admin_promocodes', 'code');
const promoIdDataset = registerDataset(adminPromocodes, 'admin_promocodes_by_id');
const adminLogsDataset = registerDataset(adminLogs, 'admin_logs');
const transactionsDataset = registerDataset(profileTransactions, 'profile_transactions');
const rankLevelsDataset = registerDataset(rankLevels, 'rank_levels');
const rankRewardsDataset = registerDataset(rankRewards, 'rank_rewards');
const verificationRequestsDataset = registerDataset(verificationRequests, 'verification_requests');
const verificationUploadsDataset = registerDataset(verificationUploads, 'verification_uploads');
const verificationQueueDataset = registerDataset(verificationQueue, 'verification_queue');
const communicationThreadsDataset = registerDataset(communicationThreads, 'communication_threads');
const communicationParticipantsDataset = registerDataset(
  communicationThreadParticipants,
  'communication_thread_participants',
);
const communicationMessagesDataset = registerDataset(communicationMessages, 'communication_messages');

// auth ↔ profiles parity
if (authDataset.rows.length !== profileDataset.rows.length) {
  pushError(
    `profiles: expected ${authDataset.rows.length} rows to match auth_users but received ${profileDataset.rows.length}`,
  );
}
ensureReference({
  items: profileDataset.rows,
  fromKey: 'id',
  toMap: authDataset.index,
  toLabel: 'auth_users.id',
  label: 'profiles',
});

// profile transactions
ensureReference({
  items: transactionsDataset.rows,
  fromKey: 'user_id',
  toMap: authDataset.index,
  toLabel: 'auth_users.id',
  label: 'profile_transactions',
});

// admin role permissions
ensureReference({
  items: rolePermissionsDataset.rows,
  fromKey: 'role_id',
  toMap: rolesDataset.index,
  toLabel: 'admin_roles.id',
  label: 'admin_role_permissions',
});
ensureReference({
  items: rolePermissionsDataset.rows,
  fromKey: 'permission_id',
  toMap: permissionsDataset.index,
  toLabel: 'admin_permissions.id',
  label: 'admin_role_permissions',
});

// admin logs require non-empty admin_id values
ensureNonEmptyString({
  items: adminLogsDataset.rows,
  key: 'admin_id',
  label: 'admin_logs',
});

// rank rewards reference levels
ensureReference({
  items: rankRewardsDataset.rows,
  fromKey: 'rank_level_id',
  toMap: rankLevelsDataset.index,
  toLabel: 'rank_levels.id',
  label: 'rank_rewards',
});

// verification datasets cross references
ensureReference({
  items: verificationRequestsDataset.rows,
  fromKey: 'user_id',
  toMap: authDataset.index,
  toLabel: 'auth_users.id',
  label: 'verification_requests',
});
ensureReference({
  items: verificationRequestsDataset.rows,
  fromKey: 'reviewer_id',
  toMap: authDataset.index,
  toLabel: 'auth_users.id',
  label: 'verification_requests',
  allowNull: true,
});
ensureReference({
  items: verificationUploadsDataset.rows,
  fromKey: 'user_id',
  toMap: authDataset.index,
  toLabel: 'auth_users.id',
  label: 'verification_uploads',
});
ensureReference({
  items: verificationUploadsDataset.rows,
  fromKey: 'request_id',
  toMap: verificationRequestsDataset.index,
  toLabel: 'verification_requests.id',
  label: 'verification_uploads',
  allowNull: true,
});
ensureReference({
  items: verificationQueueDataset.rows,
  fromKey: 'user_id',
  toMap: authDataset.index,
  toLabel: 'auth_users.id',
  label: 'verification_queue',
});
ensureReference({
  items: verificationQueueDataset.rows,
  fromKey: 'request_id',
  toMap: verificationRequestsDataset.index,
  toLabel: 'verification_requests.id',
  label: 'verification_queue',
  allowNull: true,
});

// communications relationships
ensureReference({
  items: communicationParticipantsDataset.rows,
  fromKey: 'thread_id',
  toMap: communicationThreadsDataset.index,
  toLabel: 'communication_threads.id',
  label: 'communication_thread_participants',
});
ensureReference({
  items: communicationMessagesDataset.rows,
  fromKey: 'thread_id',
  toMap: communicationThreadsDataset.index,
  toLabel: 'communication_threads.id',
  label: 'communication_messages',
});
ensureReference({
  items: communicationMessagesDataset.rows,
  fromKey: 'participant_id',
  toMap: communicationParticipantsDataset.index,
  toLabel: 'communication_thread_participants.id',
  label: 'communication_messages',
});

// verification queue requires non-empty status strings
ensureNonEmptyString({
  items: verificationQueueDataset.rows,
  key: 'status',
  label: 'verification_queue',
});

const totalDatasets = {
  authUsers: authDataset.rows.length,
  profiles: profileDataset.rows.length,
  adminRoles: rolesDataset.rows.length,
  adminPermissions: permissionsDataset.rows.length,
  adminRolePermissions: rolePermissionsDataset.rows.length,
  adminPromocodes: promocodeDataset.rows.length,
  adminLogs: adminLogsDataset.rows.length,
  profileTransactions: transactionsDataset.rows.length,
  rankLevels: rankLevelsDataset.rows.length,
  rankRewards: rankRewardsDataset.rows.length,
  verificationRequests: verificationRequestsDataset.rows.length,
  verificationUploads: verificationUploadsDataset.rows.length,
  verificationQueue: verificationQueueDataset.rows.length,
  communicationThreads: communicationThreadsDataset.rows.length,
  communicationParticipants: communicationParticipantsDataset.rows.length,
  communicationMessages: communicationMessagesDataset.rows.length,
};

if (errors.length) {
  console.error('❌ Local-sim canonical dataset failed validation:');
  for (const message of errors) {
    console.error(`  - ${message}`);
  }
  console.error('\nDataset sizes:', totalDatasets);
  process.exitCode = 1;
} else {
  console.log('✅ Local-sim canonical dataset is consistent.');
  console.log('Dataset sizes:', totalDatasets);
}
