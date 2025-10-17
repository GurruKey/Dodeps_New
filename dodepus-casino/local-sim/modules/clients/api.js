import { composeUser, loadExtras } from '../auth/index.js';
import { listClientRecords } from './storage/index.js';

const cloneClient = (client) => JSON.parse(JSON.stringify(client));

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeString = (value) => {
  if (value == null) return '';
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  return '';
};

const normalizeStatus = (value) => {
  const normalized = normalizeString(value);
  return normalized ? normalized.toLowerCase() : '';
};

const dedupeRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  const unique = new Set();
  roles
    .map((role) => normalizeString(String(role ?? '')))
    .filter(Boolean)
    .forEach((role) => {
      unique.add(role.toLowerCase());
    });
  return Array.from(unique);
};

const extractRoleLevel = (user) => {
  const { user_metadata: userMeta = {}, app_metadata: appMeta = {} } = user ?? {};
  const candidates = [
    user?.roleLevel,
    userMeta.roleLevel,
    userMeta.level,
    userMeta.adminLevel,
    appMeta.roleLevel,
    appMeta.level,
  ];

  for (const candidate of candidates) {
    const level = Number(candidate);
    if (Number.isFinite(level)) {
      return level;
    }
  }

  return undefined;
};

const resolveRoleGroup = (user) => {
  const { user_metadata: userMeta = {}, app_metadata: appMeta = {} } = user ?? {};

  const candidates = [user?.role, appMeta.role, userMeta.role];

  if (Array.isArray(user?.roles) && user.roles.length) {
    candidates.push(user.roles[0]);
  }

  for (const candidate of candidates) {
    const normalized = normalizeString(candidate);
    if (normalized) return normalized.toLowerCase();
  }

  return '';
};

const composeRole = (user) => {
  const group = resolveRoleGroup(user);
  if (!group) return null;

  const role = { group };
  const level = extractRoleLevel(user);
  if (Number.isFinite(level)) {
    role.level = level;
  }
  return role;
};

const resolveStatus = (record, user, extras) => {
  const { user_metadata: userMeta = {}, app_metadata: appMeta = {} } = user ?? {};

  const candidates = [
    record?.status,
    record?.user_metadata?.status,
    record?.user_metadata?.accountStatus,
    record?.user_metadata?.state,
    record?.app_metadata?.status,
    record?.app_metadata?.accountStatus,
    user?.status,
    userMeta.status,
    userMeta.accountStatus,
    userMeta.state,
    appMeta.status,
    appMeta.accountStatus,
    extras?.status,
    extras?.accountStatus,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeStatus(candidate);
    if (normalized) return normalized;
  }

  return 'active';
};

export const composeAdminClient = (record) => {
  if (!record) return null;

  const extras = loadExtras(record.id);
  const user = composeUser(record, extras);
  if (!user) return null;

  const balances = {
    main: toNumber(user.balance),
    casino: toNumber(user.casinoBalance),
  };

  const totalBalance = balances.main + balances.casino;

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt ?? record?.created_at ?? null,
    totalBalance,
    status: resolveStatus(record, user, extras),
    role: composeRole(user),
    roles: dedupeRoles(user.roles),
    balances,
    metadata: {
      app: user.app_metadata ?? {},
      user: user.user_metadata ?? {},
    },
    profile: extras,
  };
};

export const readAdminClients = () => {
  return listClientRecords().map(composeAdminClient).filter(Boolean);
};

const createAbortError = (reason) => {
  if (reason instanceof Error) return reason;
  if (typeof DOMException === 'function') {
    return new DOMException('Aborted', 'AbortError');
  }
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
};

export function listClients({ signal, delay = 200 } = {}) {
  if (signal?.aborted) {
    return Promise.reject(createAbortError(signal.reason));
  }

  return new Promise((resolve, reject) => {
    const timeout = Math.max(0, delay);

    const complete = () => {
      try {
        const clients = readAdminClients().map(cloneClient);
        resolve(clients);
      } catch (error) {
        reject(error);
      }
    };

    const timer = setTimeout(complete, timeout);

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(createAbortError(signal.reason));
        },
        { once: true },
      );
    }
  });
}
