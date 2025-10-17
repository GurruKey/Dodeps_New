const freezeOptionList = (entries) =>
  Object.freeze(entries.map(([value, label]) => Object.freeze({ value, label })));

export { ADMIN_LOGS_TABLE } from '../shared/index.js';

export const ADMIN_LOG_SECTIONS = Object.freeze({
  OVERVIEW: 'overview',
  CLIENTS: 'clients',
  PROMOCODES: 'promocodes',
  PROMOCODE_CREATE: 'promocode-create',
  PROMOCODE_ARCHIVE: 'promocode-archive',
  ROLES: 'roles',
  ROLE_EDIT: 'role-edit',
  VERIFICATION: 'verification',
  TRANSACTIONS: 'transactions',
  MODERATORS_CHAT: 'moderators-chat',
  ADMINISTRATORS_CHAT: 'administrators-chat',
  STAFF_CHAT: 'staff-chat',
  LOG_ADMIN: 'log-admin',
});

export const ADMIN_LOG_SECTION_LABELS = Object.freeze({
  [ADMIN_LOG_SECTIONS.OVERVIEW]: 'Обзор',
  [ADMIN_LOG_SECTIONS.CLIENTS]: 'Клиенты',
  [ADMIN_LOG_SECTIONS.PROMOCODES]: 'Promo',
  [ADMIN_LOG_SECTIONS.PROMOCODE_CREATE]: 'Создать Promo',
  [ADMIN_LOG_SECTIONS.PROMOCODE_ARCHIVE]: 'Архив Promo',
  [ADMIN_LOG_SECTIONS.ROLES]: 'Выдать роль',
  [ADMIN_LOG_SECTIONS.ROLE_EDIT]: 'Изменить роль',
  [ADMIN_LOG_SECTIONS.VERIFICATION]: 'Верификация',
  [ADMIN_LOG_SECTIONS.TRANSACTIONS]: 'Транзакции',
  [ADMIN_LOG_SECTIONS.MODERATORS_CHAT]: 'Модератор Чат',
  [ADMIN_LOG_SECTIONS.ADMINISTRATORS_CHAT]: 'Админ Чат',
  [ADMIN_LOG_SECTIONS.STAFF_CHAT]: 'Стаф Чат',
  [ADMIN_LOG_SECTIONS.LOG_ADMIN]: 'Log Admin',
});

export const ADMIN_LOG_SECTION_OPTIONS = freezeOptionList(Object.entries(ADMIN_LOG_SECTION_LABELS));

export const ADMIN_LOG_ROLES = Object.freeze({
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
  MANAGER: 'manager',
  MODERATOR: 'moderator',
  ANALYST: 'analyst',
  OPERATOR: 'operator',
  OWNER: 'owner',
});

export const ADMIN_LOG_ROLE_LABELS = Object.freeze({
  [ADMIN_LOG_ROLES.ADMIN]: 'Админ',
  [ADMIN_LOG_ROLES.SUPERADMIN]: 'Суперадмин',
  [ADMIN_LOG_ROLES.MANAGER]: 'Менеджер',
  [ADMIN_LOG_ROLES.MODERATOR]: 'Модератор',
  [ADMIN_LOG_ROLES.ANALYST]: 'Аналитик',
  [ADMIN_LOG_ROLES.OPERATOR]: 'Оператор',
  [ADMIN_LOG_ROLES.OWNER]: 'Владелец',
});

export const ADMIN_LOG_ROLE_OPTIONS = freezeOptionList(Object.entries(ADMIN_LOG_ROLE_LABELS));

export const DEFAULT_ADMIN_ROLE = ADMIN_LOG_ROLES.ADMIN;
export const DEFAULT_ADMIN_SECTION = ADMIN_LOG_SECTIONS.OVERVIEW;
export const DEFAULT_ADMIN_ACTION = 'Выполнил действие';
