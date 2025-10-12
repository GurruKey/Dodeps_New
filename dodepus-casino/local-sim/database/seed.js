import { buildSeedUserRecords } from '../auth/accounts/seedLocalAuth.js';
import { PRESET_ACCOUNTS } from '../auth/accounts/seedAccounts.js';
import { pickExtras } from '../auth/profileExtras.js';
import { applyVerificationSeed } from '../seed/verificationSeed.js';
import { getLocalDatabase, resetLocalDatabase } from './engine.js';
import { DEFAULT_LOCAL_DB_SCHEMA } from './schema.js';

const clone = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const splitVerificationExtras = (extras) => {
  const verificationRequests = Array.isArray(extras.verificationRequests)
    ? extras.verificationRequests.map(clone)
    : [];
  const verificationUploads = Array.isArray(extras.verificationUploads)
    ? extras.verificationUploads.map(clone)
    : [];

  const { verificationRequests: _ignoredReq, verificationUploads: _ignoredUp, ...profile } = extras;
  return { profile: clone(profile), verificationRequests, verificationUploads };
};

const buildProfileSeed = (account) => {
  const baseExtras = pickExtras({
    email: account.email,
    phone: account.phone,
    ...clone(account.extras || {}),
  });

  const seededExtras = applyVerificationSeed(baseExtras, account.id);
  const { profile, verificationRequests, verificationUploads } = splitVerificationExtras(seededExtras);

  return {
    profileRow: { id: account.id, ...profile },
    requestRows: verificationRequests.map((request) => ({
      ...clone(request),
      userId: request.userId ?? account.id,
    })),
    uploadRows: verificationUploads.map((upload) => ({
      ...clone(upload),
      userId: upload.userId ?? account.id,
    })),
  };
};

export const buildLocalDatabaseSeedState = () => {
  const userRows = buildSeedUserRecords().map(clone);

  const profileRows = [];
  const verificationRequests = [];
  const verificationUploads = [];

  PRESET_ACCOUNTS.forEach((account) => {
    const { profileRow, requestRows, uploadRows } = buildProfileSeed(account);
    profileRows.push(profileRow);
    verificationRequests.push(...requestRows);
    verificationUploads.push(...uploadRows);
  });

  const baseTables = Object.keys(DEFAULT_LOCAL_DB_SCHEMA.tables).reduce((acc, tableName) => {
    acc[tableName] = { primaryKey: DEFAULT_LOCAL_DB_SCHEMA.tables[tableName].primaryKey, rows: [] };
    return acc;
  }, {});

  return {
    version: DEFAULT_LOCAL_DB_SCHEMA.version,
    tables: {
      ...baseTables,
      auth_users: { primaryKey: 'id', rows: userRows },
      profiles: { primaryKey: 'id', rows: profileRows },
      verification_requests: { primaryKey: 'id', rows: verificationRequests },
      verification_uploads: { primaryKey: 'id', rows: verificationUploads },
    },
  };
};

export const applyLocalDatabaseSeed = () => {
  const seedState = buildLocalDatabaseSeedState();
  resetLocalDatabase(seedState);
  return getLocalDatabase();
};
