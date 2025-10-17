import {
  AUTH_USERS_TABLE,
  PRESET_ACCOUNTS,
  PROFILES_TABLE,
  buildSeedUserRecords,
  pickExtras,
} from '../modules/auth/index.js';
import adminLogsDataset from '../db/admin_logs.json' assert { type: 'json' };
import adminPermissionsDataset from '../db/admin_permissions.json' assert { type: 'json' };
import adminPromocodesDataset from '../db/admin_promocodes.json' assert { type: 'json' };
import adminRolePermissionsDataset from '../db/admin_role_permissions.json' assert { type: 'json' };
import adminRolesDataset from '../db/admin_roles.json' assert { type: 'json' };
import communicationMessages from '../db/communication_messages.json' assert { type: 'json' };
import communicationThreadParticipants from '../db/communication_thread_participants.json' assert { type: 'json' };
import communicationThreads from '../db/communication_threads.json' assert { type: 'json' };
import profileTransactionsDataset from '../db/profile_transactions.json' assert { type: 'json' };
import rankLevelsDataset from '../db/rank_levels.json' assert { type: 'json' };
import rankRewardsDataset from '../db/rank_rewards.json' assert { type: 'json' };
import verificationQueueDataset from '../db/verification_queue.json' assert { type: 'json' };
import verificationRequestsDataset from '../db/verification_requests.json' assert { type: 'json' };
import verificationUploadsDataset from '../db/verification_uploads.json' assert { type: 'json' };
import { ADMIN_PROMOCODES_TABLE } from '../modules/promo/index.js';
import {
  ADMIN_PERMISSIONS_TABLE,
  ADMIN_ROLE_PERMISSIONS_TABLE,
  ADMIN_ROLES_TABLE,
} from '../modules/access/index.js';
import { PROFILE_TRANSACTIONS_TABLE } from '../modules/transactions/index.js';
import { ADMIN_LOGS_TABLE } from '../modules/logs/index.js';
import {
  COMMUNICATION_MESSAGES_TABLE,
  COMMUNICATION_THREAD_PARTICIPANTS_TABLE,
  COMMUNICATION_THREADS_TABLE,
} from '../modules/communications/index.js';
import { RANK_LEVELS_TABLE, RANK_REWARDS_TABLE } from '../modules/rank/index.js';
import {
  VERIFICATION_QUEUE_TABLE,
  VERIFICATION_REQUESTS_TABLE,
  VERIFICATION_UPLOADS_TABLE,
  applyVerificationSeed,
} from '../modules/verification/index.js';
import { getLocalDatabase, resetLocalDatabase } from './engine.js';
import { DEFAULT_LOCAL_DB_SCHEMA } from './schema.js';

const clone = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const normalizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  return trimmed;
};

const normalizeOptionalText = (value) => {
  const text = normalizeText(value);
  return text || null;
};

const normalizeMultilineText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/\r\n/g, '\n').trim();
};

const normalizeOptionalMultiline = (value) => {
  const text = normalizeMultilineText(value);
  return text || null;
};

const normalizeRankSlug = (value, level) => {
  const base = normalizeText(value).toLowerCase();
  if (base) {
    const slug = base
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');
    if (slug) {
      return slug === 'vip' && Number.isInteger(level) ? `vip-${level}` : slug;
    }
  }
  if (Number.isInteger(level)) {
    return level === 0 ? 'user' : `vip-${level}`;
  }
  return 'vip';
};

const normalizeHexColor = (value, fallback = null) => {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return fallback;
  }
  const prefixed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(prefixed)) {
    return fallback;
  }
  if (prefixed.length === 4) {
    const [, r, g, b] = prefixed;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return prefixed;
};

const normalizeBadgeEffectSeed = (value, fallback = 'solid') => {
  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  return normalized || fallback;
};

const normalizeBadgeSpeedSeed = (value, fallback = 6) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  const clamped = Math.min(Math.max(numeric, 2), 12);
  return Math.round(clamped * 10) / 10;
};

const normalizeRankLevelRow = (row, index = 0) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const level = normalizeNonNegativeInt(row.level ?? row.tier ?? index, index);
  const id = normalizeText(row.id) || `rank_level_seed_${String(level).padStart(3, '0')}`;
  const slug = normalizeRankSlug(row.slug ?? row.name ?? row.label, level);
  const label = normalizeText(row.label) || (Number.isInteger(level) ? `VIP ${level}` : 'VIP');
  const shortLabel =
    normalizeText(row.short_label ?? row.shortLabel ?? '') || label;
  const group = (normalizeText(row.group ?? row.rank_group ?? '') || 'vip').toLowerCase();
  const tier = normalizeNonNegativeInt(row.tier ?? level, level);
  const depositStep = normalizeNonNegativeInt(row.deposit_step ?? row.depositStep ?? 0, 0);
  const totalDeposit = normalizeNonNegativeInt(
    row.total_deposit ?? row.totalDeposit ?? depositStep,
    depositStep,
  );
  const sortOrder = normalizeNonNegativeInt(
    row.sort_order ?? row.sortOrder ?? tier ?? level,
    tier ?? level,
  );
  const createdAt =
    normalizeDateTime(row.created_at ?? row.createdAt ?? DEFAULT_RANK_SEED_TIMESTAMP) ??
    DEFAULT_RANK_SEED_TIMESTAMP;
  const updatedAt = normalizeDateTime(row.updated_at ?? row.updatedAt ?? createdAt) ?? createdAt;

  return {
    id,
    level,
    slug,
    label,
    short_label: shortLabel,
    group,
    tier,
    deposit_step: depositStep,
    total_deposit: totalDeposit,
    sort_order: sortOrder,
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

const normalizeRankRewardRow = (row, index = 0, { byId, byLevel } = {}) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const rawLevel = row.level ?? row.rank_level ?? row.tier;
  const level = normalizeNonNegativeInt(rawLevel, null);
  const fallbackLevel = normalizeNonNegativeInt(index, null);
  const resolvedLevel = Number.isInteger(level) ? level : fallbackLevel;
  if (!Number.isInteger(resolvedLevel)) {
    return null;
  }

  const resolvedRankLevelId = normalizeText(row.rank_level_id ?? row.rankLevelId ?? '');
  const relatedLevelByLevel = byLevel && byLevel.get(resolvedLevel);
  const relatedLevelById = resolvedRankLevelId && byId ? byId.get(resolvedRankLevelId) : null;
  const finalRankLevelId = resolvedRankLevelId || relatedLevelByLevel?.id || null;
  if (!finalRankLevelId) {
    return null;
  }

  const id = normalizeText(row.id) || `rank_reward_seed_${String(resolvedLevel).padStart(3, '0')}`;
  const label = normalizeText(row.label) || `VIP ${resolvedLevel}`;
  const badgeColor = normalizeHexColor(row.badge_color ?? row.badgeColor, '#adb5bd');
  const badgeColorSecondary = normalizeHexColor(
    row.badge_color_secondary ?? row.badgeColorSecondary,
    badgeColor,
  );
  const badgeColorTertiary = normalizeHexColor(
    row.badge_color_tertiary ?? row.badgeColorTertiary,
    badgeColorSecondary,
  );
  const badgeTextColor = normalizeHexColor(row.badge_text_color ?? row.badgeTextColor, '#212529');
  const badgeEffect = normalizeBadgeEffectSeed(row.badge_effect ?? row.badgeEffect, 'solid');
  const badgeEffectSpeed = normalizeBadgeSpeedSeed(row.badge_effect_speed ?? row.badgeEffectSpeed, 6);
  const tagline = normalizeOptionalMultiline(row.tagline) ?? '';
  const description = normalizeOptionalMultiline(row.description) ?? '';
  const purpose = normalizeOptionalMultiline(row.purpose) ?? '';
  const createdAt =
    normalizeDateTime(row.created_at ?? row.createdAt ?? DEFAULT_RANK_SEED_TIMESTAMP) ??
    DEFAULT_RANK_SEED_TIMESTAMP;
  const updatedAt = normalizeDateTime(row.updated_at ?? row.updatedAt ?? createdAt) ?? createdAt;

  return {
    id,
    rank_level_id: finalRankLevelId,
    level: resolvedLevel,
    label,
    badge_color: badgeColor,
    badge_color_secondary: badgeColorSecondary,
    badge_color_tertiary: badgeColorTertiary,
    badge_text_color: badgeTextColor,
    badge_effect: badgeEffect,
    badge_effect_speed: badgeEffectSpeed,
    tagline,
    description,
    purpose,
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

const normalizePositiveIntOrNull = (value) => {
  if (value == null || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }
  return Math.floor(numeric);
};

const normalizeNonNegativeInt = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }
  return Math.floor(numeric);
};

const normalizeNullableNumber = (value) => {
  if (value == null || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return numeric;
};

const normalizeDateTime = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
};

const normalizeBooleanFieldMap = (fields = {}) => {
  const base = { email: false, phone: false, address: false, doc: false };
  if (!fields || typeof fields !== 'object') {
    return base;
  }

  Object.keys(base).forEach((key) => {
    if (key in fields) {
      base[key] = Boolean(fields[key]);
      return;
    }

    const altKey = `${key}_verified`;
    if (altKey in fields) {
      base[key] = Boolean(fields[altKey]);
      return;
    }

    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    if (camelKey in fields) {
      base[key] = Boolean(fields[camelKey]);
      return;
    }
  });

  if ('document' in fields) {
    base.doc = Boolean(fields.document);
  }

  return base;
};

let verificationRequestIdCounter = 0;
const createVerificationRequestId = () =>
  `vrf_req_seed_${String(++verificationRequestIdCounter).padStart(4, '0')}`;

let verificationHistoryIdCounter = 0;
const createVerificationHistoryId = () =>
  `vrf_req_hist_seed_${String(++verificationHistoryIdCounter).padStart(4, '0')}`;

let verificationUploadIdCounter = 0;
const createVerificationUploadId = () =>
  `vrf_upload_seed_${String(++verificationUploadIdCounter).padStart(4, '0')}`;

let verificationQueueIdCounter = 0;
const createVerificationQueueId = () =>
  `vrf_queue_seed_${String(++verificationQueueIdCounter).padStart(4, '0')}`;

let adminLogIdCounter = 0;
const createAdminLogId = () =>
  `admin_log_seed_${String(++adminLogIdCounter).padStart(4, '0')}`;

const ADMIN_PROMOCODE_ALLOWED_STATUSES = new Set([
  'draft',
  'active',
  'paused',
  'archived',
  'scheduled',
  'expired',
]);

let adminPromocodeIdCounter = 0;
const createAdminPromocodeId = () =>
  `promo_seed_${String(++adminPromocodeIdCounter).padStart(4, '0')}`;

const normalizePromocodeCode = (value, fallback = '') => {
  const base = normalizeText(value);
  if (!base) {
    return fallback ? fallback : '';
  }
  return base.replace(/\s+/g, '_').toUpperCase();
};

const normalizePromocodeStatus = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  if (ADMIN_PROMOCODE_ALLOWED_STATUSES.has(normalized)) {
    return normalized;
  }
  return 'draft';
};

const DEFAULT_ACCESS_SEED_TIMESTAMP = '2024-10-10T12:00:00.000Z';
const DEFAULT_RANK_SEED_TIMESTAMP = DEFAULT_ACCESS_SEED_TIMESTAMP;

const resolveRoleLevel = (value) => {
  const numeric = normalizeNullableNumber(value);
  if (numeric == null || Number.isNaN(numeric) || numeric < 0) {
    return null;
  }
  return Math.floor(numeric);
};

const normalizeAdminRoleRow = (role, index = 0) => {
  if (!role || typeof role !== 'object') {
    return null;
  }

  const id = normalizeText(role.id) || `admin_role_seed_${String(index + 1).padStart(3, '0')}`;
  const group = normalizeText(role.role_group ?? role.group ?? role.roleGroup ?? '') || 'intern';
  const level = resolveRoleLevel(role.level ?? role.role_level ?? role.roleLevel);
  const name = normalizeText(role.name) || id;
  const description = normalizeOptionalText(role.description ?? role.details ?? role.summary ?? null);
  const sortOrder = normalizeNonNegativeInt(role.sort_order ?? role.order ?? index + 1, index + 1);
  const isAdmin = Boolean(role.is_admin ?? role.isAdmin ?? false);
  const createdAt =
    normalizeDateTime(role.created_at ?? role.createdAt ?? DEFAULT_ACCESS_SEED_TIMESTAMP) ?? DEFAULT_ACCESS_SEED_TIMESTAMP;
  const updatedAt = normalizeDateTime(role.updated_at ?? role.updatedAt ?? createdAt) ?? createdAt;

  return {
    id,
    role_group: group,
    level,
    is_admin: isAdmin,
    name,
    description,
    sort_order: sortOrder,
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

const normalizeAdminPermissionRow = (permission, index = 0) => {
  if (!permission || typeof permission !== 'object') {
    return null;
  }

  const id = normalizeText(permission.id ?? permission.permission_id ?? permission.key ?? permission.permissionKey);
  if (!id) {
    return null;
  }

  const label = normalizeText(permission.label ?? permission.title ?? '') || id;
  const description = normalizeOptionalText(permission.description ?? permission.summary ?? null);
  const sortOrder = normalizeNonNegativeInt(permission.sort_order ?? permission.order ?? index + 1, index + 1);
  const createdAt =
    normalizeDateTime(permission.created_at ?? permission.createdAt ?? DEFAULT_ACCESS_SEED_TIMESTAMP) ??
    DEFAULT_ACCESS_SEED_TIMESTAMP;
  const updatedAt = normalizeDateTime(permission.updated_at ?? permission.updatedAt ?? createdAt) ?? createdAt;

  return {
    id,
    label,
    description,
    sort_order: sortOrder,
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

const normalizeAdminRolePermissionRow = (entry, index, validRoleIds, validPermissionIds) => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const roleId = normalizeText(entry.role_id ?? entry.roleId ?? entry.role);
  const permissionId = normalizeText(
    entry.permission_id ?? entry.permissionId ?? entry.permission_key ?? entry.permissionKey,
  );

  if (!roleId || !permissionId) {
    return null;
  }

  if (validRoleIds && !validRoleIds.has(roleId)) {
    return null;
  }

  if (validPermissionIds && !validPermissionIds.has(permissionId)) {
    return null;
  }

  const id = normalizeText(entry.id) || `admin_role_permission_seed_${String(index + 1).padStart(4, '0')}`;
  const allowed =
    entry.allowed === undefined && entry.is_allowed === undefined && entry.value === undefined
      ? true
      : Boolean(entry.allowed ?? entry.is_allowed ?? entry.value);
  const sortOrder = normalizeNonNegativeInt(entry.sort_order ?? entry.order ?? index + 1, index + 1);
  const createdAt =
    normalizeDateTime(entry.created_at ?? entry.createdAt ?? DEFAULT_ACCESS_SEED_TIMESTAMP) ?? DEFAULT_ACCESS_SEED_TIMESTAMP;
  const updatedAt = normalizeDateTime(entry.updated_at ?? entry.updatedAt ?? createdAt) ?? createdAt;

  return {
    id,
    role_id: roleId,
    permission_id: permissionId,
    allowed,
    sort_order: sortOrder,
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

const normalizePromocodeActivation = (activation, code, index) => {
  if (!activation || typeof activation !== 'object') {
    return null;
  }

  const activatedAt =
    normalizeDateTime(
      activation.activated_at ??
        activation.activatedAt ??
        activation.created_at ??
        activation.createdAt,
    ) ?? null;

  if (!activatedAt) {
    return null;
  }

  const id =
    normalizeText(activation.id) ||
    `${code || 'promo'}_activation_${String(index + 1).padStart(3, '0')}`;

  const clientId = normalizeOptionalText(
    activation.client_id ?? activation.clientId ?? activation.player_id ?? activation.playerId,
  );

  const entry = { id, activated_at: activatedAt };
  if (clientId) {
    entry.client_id = clientId;
  }
  return entry;
};

const normalizeAdminPromocodeRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const code = normalizePromocodeCode(row.code);
  if (!code) {
    return null;
  }

  const id = normalizeText(row.id) || createAdminPromocodeId();
  const typeId = normalizeText(row.type_id ?? row.typeId) || 'generic';
  const title = normalizeText(row.title) || code;
  const reward = normalizeText(row.reward);
  const status = normalizePromocodeStatus(row.status);
  const limit = normalizePositiveIntOrNull(row.limit);
  const used = normalizeNonNegativeInt(row.used, 0);
  const wager = normalizeNullableNumber(row.wager);
  const cashoutCap = normalizeNullableNumber(row.cashout_cap ?? row.cashoutCap);
  const notes = normalizeText(row.notes);
  const params = row.params && typeof row.params === 'object' ? clone(row.params) : {};
  const startsAt = normalizeDateTime(row.starts_at ?? row.startsAt);
  const endsAt = normalizeDateTime(row.ends_at ?? row.endsAt);
  const createdAt = normalizeDateTime(row.created_at ?? row.createdAt);
  const updatedAt = normalizeDateTime(row.updated_at ?? row.updatedAt);

  const activations = ensureArray(row.activations)
    .map((activation, index) => normalizePromocodeActivation(activation, code, index))
    .filter(Boolean)
    .sort((a, b) => Date.parse(b.activated_at) - Date.parse(a.activated_at));

  return {
    id,
    code,
    type_id: typeId,
    title,
    reward,
    status,
    limit,
    used,
    wager,
    cashout_cap: cashoutCap,
    notes,
    params,
    starts_at: startsAt,
    ends_at: endsAt,
    created_at: createdAt,
    updated_at: updatedAt,
    activations,
  };
};

const normalizeAdminLogRow = (row) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = normalizeText(row.id) || createAdminLogId();
  const adminId = normalizeText(row.admin_id ?? row.adminId) || 'unknown';
  const adminName = normalizeText(row.admin_name ?? row.adminName) || 'Неизвестный админ';
  const role = (normalizeText(row.role) || 'admin').toLowerCase();
  const section = (normalizeText(row.section) || 'overview').toLowerCase();
  const action = normalizeText(row.action) || 'Выполнил действие';
  const context = normalizeOptionalText(row.context ?? row.details);
  const createdAt = normalizeDateTime(row.created_at ?? row.createdAt ?? row.timestamp) ?? null;
  const metadata = row.metadata && typeof row.metadata === 'object' ? clone(row.metadata) : undefined;

  const normalized = {
    id,
    admin_id: adminId,
    admin_name: adminName,
    role,
    section,
    action,
    created_at: createdAt,
  };

  if (context) {
    normalized.context = context;
  }

  if (metadata) {
    normalized.metadata = metadata;
  }

  return normalized;
};

const normalizeVerificationHistoryEntry = (entry, requestId) => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const reviewer =
    entry.reviewer && typeof entry.reviewer === 'object' ? entry.reviewer : {};

  return {
    id: normalizeText(entry.id) || createVerificationHistoryId(),
    request_id: normalizeText(entry.request_id ?? entry.requestId) || requestId,
    status: normalizeText(entry.status).toLowerCase() || 'pending',
    notes: normalizeText(entry.notes),
    updated_at: entry.updated_at ?? entry.updatedAt ?? entry.timestamp ?? null,
    reviewer_id: normalizeOptionalText(
      entry.reviewer_id ?? entry.reviewerId ?? reviewer.id,
    ),
    reviewer_name: normalizeOptionalText(
      entry.reviewer_name ?? entry.reviewerName ?? reviewer.name,
    ),
    reviewer_role: normalizeOptionalText(
      entry.reviewer_role ?? entry.reviewerRole ?? reviewer.role,
    ),
    completed_fields: normalizeBooleanFieldMap(
      entry.completed_fields ?? entry.completedFields,
    ),
    requested_fields: normalizeBooleanFieldMap(
      entry.requested_fields ?? entry.requestedFields ?? entry.completed_fields ?? entry.completedFields,
    ),
    cleared_fields: normalizeBooleanFieldMap(
      entry.cleared_fields ?? entry.clearedFields,
    ),
  };
};

const normalizeVerificationRequestRow = (row, fallbackUserId) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = normalizeText(row.id) || createVerificationRequestId();
  const userId =
    normalizeText(row.user_id) ||
    normalizeText(row.userId) ||
    normalizeText(fallbackUserId) ||
    'unknown';

  const status = normalizeText(row.status).toLowerCase() || 'pending';
  const submittedAt =
    row.submitted_at ?? row.submittedAt ?? row.created_at ?? row.createdAt ?? null;
  const updatedAt = row.updated_at ?? row.updatedAt ?? submittedAt;
  const reviewedAt = row.reviewed_at ?? row.reviewedAt ?? null;

  const history = Array.isArray(row.history)
    ? row.history
        .map((entry) => normalizeVerificationHistoryEntry(entry, id))
        .filter(Boolean)
    : [];

  const metadata =
    row.metadata && typeof row.metadata === 'object' ? clone(row.metadata) : undefined;

  return {
    id,
    user_id: userId,
    status,
    submitted_at: submittedAt,
    updated_at: updatedAt,
    reviewed_at: reviewedAt,
    reviewer_id: normalizeOptionalText(row.reviewer_id ?? row.reviewerId),
    reviewer_name: normalizeOptionalText(row.reviewer_name ?? row.reviewerName),
    reviewer_role: normalizeOptionalText(row.reviewer_role ?? row.reviewerRole),
    notes: normalizeText(row.notes),
    completed_fields: normalizeBooleanFieldMap(
      row.completed_fields ?? row.completedFields,
    ),
    requested_fields: normalizeBooleanFieldMap(
      row.requested_fields ??
        row.requestedFields ??
        row.completed_fields ??
        row.completedFields,
    ),
    cleared_fields: normalizeBooleanFieldMap(
      row.cleared_fields ?? row.clearedFields,
    ),
    history,
    ...(metadata ? { metadata } : {}),
  };
};

const normalizeVerificationUploadRow = (row, fallbackUserId) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = normalizeText(row.id) || createVerificationUploadId();
  const userId =
    normalizeText(row.user_id) ||
    normalizeText(row.userId) ||
    normalizeText(fallbackUserId) ||
    'unknown';

  return {
    id,
    user_id: userId,
    request_id: normalizeOptionalText(row.request_id ?? row.requestId),
    file_name: normalizeOptionalText(row.file_name ?? row.fileName),
    file_type: normalizeText(row.file_type ?? row.fileType) || 'document',
    file_url: normalizeOptionalText(row.file_url ?? row.fileUrl),
    status: normalizeText(row.status).toLowerCase() || 'pending',
    uploaded_at: row.uploaded_at ?? row.uploadedAt ?? null,
  };
};

const normalizeVerificationQueueRow = (row, fallbackUserId) => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const id = normalizeText(row.id) || createVerificationQueueId();
  const userId =
    normalizeText(row.user_id) ||
    normalizeText(row.userId) ||
    normalizeText(fallbackUserId) ||
    'unknown';

  return {
    id,
    request_id: normalizeOptionalText(row.request_id ?? row.requestId),
    user_id: userId,
    document_type: normalizeText(row.document_type ?? row.documentType) || 'Документ',
    status: normalizeText(row.status).toLowerCase() || 'idle',
    submitted_at: row.submitted_at ?? row.submittedAt ?? null,
    priority: normalizeText(row.priority).toLowerCase() || 'normal',
  };
};

const splitProfileExtras = (extras, userId) => {
  const verificationRequests = Array.isArray(extras.verificationRequests)
    ? extras.verificationRequests.map(clone)
    : [];
  const verificationUploads = Array.isArray(extras.verificationUploads)
    ? extras.verificationUploads.map(clone)
    : [];
  const transactions = Array.isArray(extras.transactions)
    ? extras.transactions.map((transaction) => ({
        ...clone(transaction),
        userId: transaction?.userId ?? transaction?.user_id ?? userId,
      }))
    : [];

  const {
    verificationRequests: _ignoredReq,
    verificationUploads: _ignoredUp,
    transactions: _ignoredTxn,
    ...profile
  } = extras;

  return {
    profile: clone(profile),
    verificationRequests,
    verificationUploads,
    transactions,
  };
};

const buildProfileSeed = (account) => {
  const baseExtras = pickExtras({
    email: account.email,
    phone: account.phone,
    ...clone(account.extras || {}),
  });

  const seededExtras = applyVerificationSeed(baseExtras, account.id);
  const { profile, verificationRequests, verificationUploads, transactions } = splitProfileExtras(
    seededExtras,
    account.id,
  );

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
    transactionRows: transactions.map((transaction) => ({
      ...clone(transaction),
      userId: transaction.userId ?? account.id,
    })),
  };
};

export const buildLocalDatabaseSeedState = () => {
  const userRows = buildSeedUserRecords().map(clone);

  const profileRows = [];
  const verificationRequestExtras = [];
  const verificationUploadExtras = [];
  const profileTransactionsExtras = [];
  const adminPromocodeRows = ensureArray(adminPromocodesDataset)
    .map((row) => normalizeAdminPromocodeRow(row))
    .filter(Boolean);
  const adminLogRows = ensureArray(adminLogsDataset)
    .map((row) => normalizeAdminLogRow(row))
    .filter(Boolean);

  const communicationThreadRows = ensureArray(communicationThreads).map(clone);
  const communicationParticipantRows = ensureArray(communicationThreadParticipants).map(clone);
  const communicationMessageRows = ensureArray(communicationMessages).map(clone);
  const profileTransactionRows = ensureArray(profileTransactionsDataset).map(clone);

  const rankLevelMap = new Map();
  const rankLevelByLevel = new Map();
  ensureArray(rankLevelsDataset)
    .map((row, index) => normalizeRankLevelRow(row, index))
    .filter(Boolean)
    .forEach((row) => {
      rankLevelMap.set(row.id, row);
      if (!rankLevelByLevel.has(row.level)) {
        rankLevelByLevel.set(row.level, row);
      }
    });

  const rankRewardMap = new Map();
  ensureArray(rankRewardsDataset)
    .map((row, index) => normalizeRankRewardRow(row, index, { byId: rankLevelMap, byLevel: rankLevelByLevel }))
    .filter(Boolean)
    .forEach((row) => {
      rankRewardMap.set(row.id, row);
    });

  const adminRoleRows = ensureArray(adminRolesDataset)
    .map((row, index) => normalizeAdminRoleRow(row, index))
    .filter(Boolean);
  const adminPermissionRows = ensureArray(adminPermissionsDataset)
    .map((row, index) => normalizeAdminPermissionRow(row, index))
    .filter(Boolean);
  const roleIdSet = new Set(adminRoleRows.map((row) => row.id));
  const permissionIdSet = new Set(adminPermissionRows.map((row) => row.id));
  const adminRolePermissionRows = ensureArray(adminRolePermissionsDataset)
    .map((row, index) => normalizeAdminRolePermissionRow(row, index, roleIdSet, permissionIdSet))
    .filter(Boolean);

  PRESET_ACCOUNTS.forEach((account) => {
    const { profileRow, requestRows, uploadRows, transactionRows } = buildProfileSeed(account);
    profileRows.push(profileRow);
    verificationRequestExtras.push(...requestRows);
    verificationUploadExtras.push(...uploadRows);
    profileTransactionsExtras.push(...transactionRows);
  });

  const baseTables = Object.keys(DEFAULT_LOCAL_DB_SCHEMA.tables).reduce((acc, tableName) => {
    acc[tableName] = { primaryKey: DEFAULT_LOCAL_DB_SCHEMA.tables[tableName].primaryKey, rows: [] };
    return acc;
  }, {});

  const verificationRequestRows = ensureArray(verificationRequestsDataset).map(clone);
  const verificationUploadRows = ensureArray(verificationUploadsDataset).map(clone);
  const verificationQueueRows = ensureArray(verificationQueueDataset).map(clone);

  const profileTransactionsMap = new Map();
  [...profileTransactionRows, ...profileTransactionsExtras].forEach((transaction) => {
    if (!transaction || typeof transaction !== 'object') {
      return;
    }

    const userId = transaction.user_id || transaction.userId || 'unknown';
    const baseId = transaction.id || `${userId}:txn:${String(profileTransactionsMap.size + 1).padStart(4, '0')}`;

    if (profileTransactionsMap.has(baseId)) {
      return;
    }

    const normalized = { ...transaction, id: baseId, user_id: userId };

    if (!normalized.transaction_type && normalized.type) {
      normalized.transaction_type = normalized.type;
    }

    if (!normalized.status && normalized.transaction_status) {
      normalized.status = normalized.transaction_status;
    }

    if (!normalized.method && normalized.payment_method) {
      normalized.method = normalized.payment_method;
    }

    if (!normalized.created_at) {
      normalized.created_at = normalized.createdAt || normalized.date || normalized.timestamp || normalized.updated_at || null;
    }

    if (!normalized.updated_at) {
      normalized.updated_at = normalized.updatedAt || normalized.created_at || null;
    }

    delete normalized.userId;
    delete normalized.type;
    delete normalized.transaction_status;
    delete normalized.payment_method;
    delete normalized.createdAt;
    delete normalized.updatedAt;
    delete normalized.date;
    delete normalized.timestamp;

    profileTransactionsMap.set(baseId, normalized);
  });

  const verificationRequestsMap = new Map();
  [...verificationRequestRows, ...verificationRequestExtras].forEach((request) => {
    const normalized = normalizeVerificationRequestRow(request, request?.userId ?? request?.user_id);
    if (!normalized) {
      return;
    }
    verificationRequestsMap.set(normalized.id, normalized);
  });

  const verificationUploadsMap = new Map();
  [...verificationUploadRows, ...verificationUploadExtras].forEach((upload) => {
    const normalized = normalizeVerificationUploadRow(upload, upload?.userId ?? upload?.user_id);
    if (!normalized) {
      return;
    }
    verificationUploadsMap.set(normalized.id, normalized);
  });

  const verificationQueueMap = new Map();
  verificationQueueRows.forEach((entry) => {
    const normalized = normalizeVerificationQueueRow(entry, entry?.userId ?? entry?.user_id);
    if (!normalized) {
      return;
    }
    verificationQueueMap.set(normalized.id, normalized);
  });

  return {
    version: DEFAULT_LOCAL_DB_SCHEMA.version,
    tables: {
      ...baseTables,
      [AUTH_USERS_TABLE]: { primaryKey: 'id', rows: userRows },
      [PROFILES_TABLE]: { primaryKey: 'id', rows: profileRows },
      [VERIFICATION_REQUESTS_TABLE]: {
        primaryKey: 'id',
        rows: Array.from(verificationRequestsMap.values()),
      },
      [VERIFICATION_UPLOADS_TABLE]: {
        primaryKey: 'id',
        rows: Array.from(verificationUploadsMap.values()),
      },
      [VERIFICATION_QUEUE_TABLE]: {
        primaryKey: 'id',
        rows: Array.from(verificationQueueMap.values()),
      },
      [ADMIN_PROMOCODES_TABLE]: { primaryKey: 'id', rows: adminPromocodeRows },
      [ADMIN_ROLES_TABLE]: { primaryKey: 'id', rows: adminRoleRows },
      [ADMIN_PERMISSIONS_TABLE]: { primaryKey: 'id', rows: adminPermissionRows },
      [ADMIN_ROLE_PERMISSIONS_TABLE]: { primaryKey: 'id', rows: adminRolePermissionRows },
      [RANK_LEVELS_TABLE]: {
        primaryKey: 'id',
        rows: Array.from(rankLevelMap.values()).sort((a, b) => a.level - b.level || a.sort_order - b.sort_order),
      },
      [RANK_REWARDS_TABLE]: {
        primaryKey: 'id',
        rows: Array.from(rankRewardMap.values()).sort((a, b) => a.level - b.level || a.id.localeCompare(b.id)),
      },
      [PROFILE_TRANSACTIONS_TABLE]: {
        primaryKey: 'id',
        rows: Array.from(profileTransactionsMap.values()),
      },
      [ADMIN_LOGS_TABLE]: { primaryKey: 'id', rows: adminLogRows },
      [COMMUNICATION_THREADS_TABLE]: { primaryKey: 'id', rows: communicationThreadRows },
      [COMMUNICATION_THREAD_PARTICIPANTS_TABLE]: {
        primaryKey: 'id',
        rows: communicationParticipantRows,
      },
      [COMMUNICATION_MESSAGES_TABLE]: { primaryKey: 'id', rows: communicationMessageRows },
    },
  };
};

export const applyLocalDatabaseSeed = () => {
  const seedState = buildLocalDatabaseSeedState();
  resetLocalDatabase(seedState);
  return getLocalDatabase();
};
