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
import { TABLES } from '../modules/shared/index.js';

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

const authDataset = registerDataset(authUsers, TABLES.authUsers);
const profileDataset = registerDataset(profiles, TABLES.profiles);
const rolesDataset = registerDataset(adminRoles, TABLES.adminRoles);
const permissionsDataset = registerDataset(adminPermissions, TABLES.adminPermissions);
const rolePermissionsDataset = registerDataset(adminRolePermissions, TABLES.adminRolePermissions);
const promocodeDataset = registerDataset(adminPromocodes, TABLES.adminPromocodes, 'code');
const promoIdDataset = registerDataset(adminPromocodes, `${TABLES.adminPromocodes}_by_id`);
const adminLogsDataset = registerDataset(adminLogs, TABLES.adminLogs);
const transactionsDataset = registerDataset(profileTransactions, TABLES.profileTransactions);
const rankLevelsDataset = registerDataset(rankLevels, TABLES.rankLevels);
const rankRewardsDataset = registerDataset(rankRewards, TABLES.rankRewards);
const verificationRequestsDataset = registerDataset(verificationRequests, TABLES.verificationRequests);
const verificationUploadsDataset = registerDataset(verificationUploads, TABLES.verificationUploads);
const verificationQueueDataset = registerDataset(verificationQueue, TABLES.verificationQueue);
const communicationThreadsDataset = registerDataset(communicationThreads, TABLES.communicationThreads);
const communicationParticipantsDataset = registerDataset(
  communicationThreadParticipants,
  TABLES.communicationThreadParticipants,
);
const communicationMessagesDataset = registerDataset(communicationMessages, TABLES.communicationMessages);

// auth ↔ profiles parity
if (authDataset.rows.length !== profileDataset.rows.length) {
  pushError(
    `profiles: expected ${authDataset.rows.length} rows to match ${TABLES.authUsers} but received ${profileDataset.rows.length}`,
  );
}
ensureReference({
  items: profileDataset.rows,
  fromKey: 'id',
  toMap: authDataset.index,
  toLabel: `${TABLES.authUsers}.id`,
  label: TABLES.profiles,
});

// profile transactions
ensureReference({
  items: transactionsDataset.rows,
  fromKey: 'user_id',
  toMap: authDataset.index,
  toLabel: `${TABLES.authUsers}.id`,
  label: TABLES.profileTransactions,
});

// admin role permissions
ensureReference({
  items: rolePermissionsDataset.rows,
  fromKey: 'role_id',
  toMap: rolesDataset.index,
  toLabel: `${TABLES.adminRoles}.id`,
  label: TABLES.adminRolePermissions,
});
ensureReference({
  items: rolePermissionsDataset.rows,
  fromKey: 'permission_id',
  toMap: permissionsDataset.index,
  toLabel: `${TABLES.adminPermissions}.id`,
  label: TABLES.adminRolePermissions,
});

// admin logs require non-empty admin_id values
ensureNonEmptyString({
  items: adminLogsDataset.rows,
  key: 'admin_id',
  label: TABLES.adminLogs,
});

// rank rewards reference levels
ensureReference({
  items: rankRewardsDataset.rows,
  fromKey: 'rank_level_id',
  toMap: rankLevelsDataset.index,
  toLabel: `${TABLES.rankLevels}.id`,
  label: TABLES.rankRewards,
});

// verification datasets cross references
ensureReference({
  items: verificationRequestsDataset.rows,
  fromKey: 'user_id',
  toMap: authDataset.index,
  toLabel: `${TABLES.authUsers}.id`,
  label: TABLES.verificationRequests,
});
ensureReference({
  items: verificationRequestsDataset.rows,
  fromKey: 'reviewer_id',
  toMap: authDataset.index,
  toLabel: `${TABLES.authUsers}.id`,
  label: TABLES.verificationRequests,
  allowNull: true,
});
ensureReference({
  items: verificationUploadsDataset.rows,
  fromKey: 'user_id',
  toMap: authDataset.index,
  toLabel: `${TABLES.authUsers}.id`,
  label: TABLES.verificationUploads,
});
ensureReference({
  items: verificationUploadsDataset.rows,
  fromKey: 'request_id',
  toMap: verificationRequestsDataset.index,
  toLabel: `${TABLES.verificationRequests}.id`,
  label: TABLES.verificationUploads,
  allowNull: true,
});
ensureReference({
  items: verificationQueueDataset.rows,
  fromKey: 'user_id',
  toMap: authDataset.index,
  toLabel: `${TABLES.authUsers}.id`,
  label: TABLES.verificationQueue,
});
ensureReference({
  items: verificationQueueDataset.rows,
  fromKey: 'request_id',
  toMap: verificationRequestsDataset.index,
  toLabel: `${TABLES.verificationRequests}.id`,
  label: TABLES.verificationQueue,
  allowNull: true,
});

// communications relationships
ensureReference({
  items: communicationParticipantsDataset.rows,
  fromKey: 'thread_id',
  toMap: communicationThreadsDataset.index,
  toLabel: `${TABLES.communicationThreads}.id`,
  label: TABLES.communicationThreadParticipants,
});
ensureReference({
  items: communicationMessagesDataset.rows,
  fromKey: 'thread_id',
  toMap: communicationThreadsDataset.index,
  toLabel: `${TABLES.communicationThreads}.id`,
  label: TABLES.communicationMessages,
});
ensureReference({
  items: communicationMessagesDataset.rows,
  fromKey: 'participant_id',
  toMap: communicationParticipantsDataset.index,
  toLabel: `${TABLES.communicationThreadParticipants}.id`,
  label: TABLES.communicationMessages,
});

// verification queue requires non-empty status strings
ensureNonEmptyString({
  items: verificationQueueDataset.rows,
  key: 'status',
  label: TABLES.verificationQueue,
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
